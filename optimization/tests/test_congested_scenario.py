"""
Tests for Milestone 1.5: Congested Conflict Scenario, Naive Baseline, and CP-SAT Optimization.
"""

import pytest
from src.data.congested import generate_congested_data
from src.models import BlockPriority
from src.solver import SolverConfig, BlockPlanningEngine, NaiveScheduler, ScheduleComparator


@pytest.fixture
def congested_request():
    return generate_congested_data()


@pytest.fixture
def fast_solver_config():
    return SolverConfig(max_solve_time_seconds=5.0, num_workers=2, safety_buffer_minutes=15)


def test_congested_data_integrity(congested_request):
    """Verify that congested dataset adheres to corridor bounds and has zero internal train clashes."""
    req = congested_request
    assert len(req.assets) == 5
    assert len(req.trains) == 11
    assert len(req.block_requests) == 10
    assert req.config.get("crew_capacity") == 2

    asset_ids = {a.id for a in req.assets}
    for t in req.trains:
        for s in t.sections:
            assert s.asset_id in asset_ids
            assert 0 <= s.entry_time < s.exit_time <= 1440

    # Ensure the train timetable itself is clean (no train-train headways < 15m)
    sec_trains = {}
    for t in req.trains:
        for s in t.sections:
            b_start = max(0, s.entry_time - 15)
            b_end = min(1440, s.exit_time + 15)
            sec_trains.setdefault(s.asset_id, []).append((t.id, b_start, b_end))

    for sec, tlist in sec_trains.items():
        tlist.sort(key=lambda x: x[1])
        for i in range(len(tlist)):
            for j in range(i + 1, len(tlist)):
                a, b = tlist[i], tlist[j]
                # No overlap
                assert not (a[1] < b[2] and b[1] < a[2]), f"Train clash on {sec}: {a} vs {b}"


def test_naive_scheduler_produces_conflicts(congested_request, fast_solver_config):
    """Verify that blindly scheduling blocks at requested times causes severe operational clashes."""
    naive = NaiveScheduler(config=fast_solver_config)
    schedule, metrics = naive.schedule(congested_request)

    # Naive schedules all 10 blocks blindly
    assert metrics.blocks_scheduled == 10
    assert metrics.blocks_skipped == 0
    assert metrics.total_deviation_minutes == 0

    # But it creates multiple direct train collisions
    assert metrics.train_conflicts >= 8, f"Expected >= 8 train conflicts, got {metrics.train_conflicts}"
    assert metrics.estimated_train_delay_minutes > 500, "Expected significant accumulated train delay"
    assert metrics.affected_trains_count >= 4, "Expected multiple premier trains affected"

    # And it violates the 2-crew limit
    assert metrics.resource_conflicts > 0
    assert metrics.max_crews_demanded > metrics.crew_capacity


def test_cpsat_eliminates_all_conflicts(congested_request, fast_solver_config):
    """Verify that CP-SAT produces a 100% feasible schedule with 0 train and 0 resource conflicts."""
    engine = BlockPlanningEngine(config=fast_solver_config)
    engine.build_model(congested_request)
    result = engine.solve()

    assert result.metrics.solver_status in ["OPTIMAL", "FEASIBLE"]
    assert result.metrics.train_conflicts == 0
    assert result.metrics.estimated_train_delay_minutes == 0
    assert result.metrics.total_affected_trains == 0
    assert result.metrics.resource_conflicts == 0

    # CP-SAT scheduled a feasible subset and skipped infeasible alternatives
    assert result.metrics.total_blocks_scheduled >= 5
    assert result.metrics.total_blocks_skipped >= 2
    assert result.metrics.objective_score > 100000.0


def test_cpsat_prioritizes_higher_priority_blocks(congested_request, fast_solver_config):
    """Verify that CP-SAT prioritizes EMERGENCY (P5) and CRITICAL (P4) over LOW (P1)."""
    engine = BlockPlanningEngine(config=fast_solver_config)
    engine.build_model(congested_request)
    result = engine.solve()

    scheduled_by_id = {b.block_request_id: b for b in result.blocks}

    # Emergency repair (BR_C01, P5) must be scheduled
    assert scheduled_by_id["BR_C01"].is_scheduled is True, "Emergency repair was not prioritized!"

    # Critical OHE breakdown (BR_C03, P4) must be scheduled
    assert scheduled_by_id["BR_C03"].is_scheduled is True, "Critical OHE block was not prioritized!"

    # Low priority routine tasks that conflict must be skipped
    assert scheduled_by_id["BR_C10"].is_scheduled is False or scheduled_by_id["BR_C06"].is_scheduled is False


def test_comparator_demonstrates_measurable_improvement(congested_request, fast_solver_config):
    """Verify that ScheduleComparator quantifies the improvements from optimization."""
    comparator = ScheduleComparator(config=fast_solver_config)
    comparison = comparator.compare(congested_request)

    summary = comparison.improvement_summary
    assert summary["train_conflicts_eliminated"] > 0
    assert summary["train_conflicts_reduction_percent"] == 100.0
    assert summary["train_delay_saved_minutes"] > 0
    assert summary["resource_conflicts_resolved"] > 0
    assert summary["objective_score_delta"] > 0

    table_text = comparator.format_comparison_table(comparison)
    assert "BENCHMARK COMPARISON" in table_text
    assert "Naive Baseline" in table_text
    assert "CP-SAT Optimized" in table_text
