"""
Naive Baseline Scheduler for railway maintenance blocks.

[BASELINE BENCHMARK — Does NOT use constraint programming]

This scheduler models what happens in typical manual or unoptimized operations:
- Every maintenance block is blindly granted at its requested/preferred start time.
- No conflict detection, constraint propagation, or intelligent shifting is performed.
- The schedule is then audited against operational constraints (train timetables,
  headway safety buffers, track sections, and crew capacities) to measure the
  resulting train conflicts, delay penalties, and resource violations.
"""

import time
import uuid
from datetime import datetime, timezone

from src.models import (
    OptimizationRequest,
    ScheduledBlock,
    ScheduleMetrics,
    OptimizedSchedule,
    ComparisonMetrics,
    ResourceType,
)
from src.solver.config import SolverConfig


class NaiveScheduler:
    """Naive baseline scheduler that places all blocks at their preferred times."""

    def __init__(self, config: SolverConfig | None = None):
        self.config = config or SolverConfig()

    def schedule(self, request: OptimizationRequest) -> tuple[OptimizedSchedule, ComparisonMetrics]:
        """Execute the naive schedule and calculate operational impact metrics."""
        start_time = time.time()
        buffer = self.config.safety_buffer_minutes
        horizon = self.config.planning_horizon_minutes

        # Resolve crew capacity
        crew_cap = request.config.get("crew_capacity", self.config.crew_capacity)
        if request.resources:
            res_crews = sum(r.capacity for r in request.resources if r.resource_type == ResourceType.CREW)
            if res_crews > 0:
                crew_cap = res_crews

        assets_map = {a.id: a.name for a in request.assets}

        scheduled_blocks: list[ScheduledBlock] = []
        train_conflicts = 0
        total_train_delay = 0
        all_affected_trains = set()
        total_downtime = 0

        # 1. Schedule each block at its preferred start time
        for block in request.block_requests:
            b_start = block.preferred_start
            b_end = b_start + block.duration_minutes
            total_downtime += block.duration_minutes

            # Detect conflicts with train movements on the same asset
            block_affected_trains = []
            for train in request.trains:
                for section in train.sections:
                    if section.asset_id == block.asset_id:
                        t_buf_start = max(0, section.entry_time - buffer)
                        t_buf_end = min(horizon, section.exit_time + buffer)

                        # Check if block overlaps with buffered train occupancy
                        if b_start < t_buf_end and b_end > t_buf_start:
                            train_conflicts += 1
                            train_label = f"{train.train_number} ({train.name})"
                            block_affected_trains.append(train_label)
                            all_affected_trains.add(train_label)

                            # Estimated delay: detention until block clears the track
                            delay = max(0, b_end - t_buf_start)
                            total_train_delay += delay

            scheduled_blocks.append(ScheduledBlock(
                block_request_id=block.id,
                asset_id=block.asset_id,
                asset_name=assets_map.get(block.asset_id, block.asset_id),
                maintenance_type=block.maintenance_type.value,
                priority=block.priority.value,
                scheduled_start=b_start,
                scheduled_end=b_end,
                duration_minutes=block.duration_minutes,
                preferred_start=block.preferred_start,
                deviation_minutes=0,  # Zero deviation because placed at preferred time
                affected_trains=block_affected_trains,
                is_scheduled=True,
                skip_reason=None,
            ))

        # 2. Check crew resource demand across the 24-hour timeline
        crew_timeline = [0] * horizon
        for block in request.block_requests:
            for m in range(block.preferred_start, min(horizon, block.preferred_start + block.duration_minutes)):
                crew_timeline[m] += block.crew_required

        resource_conflicts = 0
        in_violation = False
        max_crew_demanded = max(crew_timeline) if crew_timeline else 0

        for m in range(horizon):
            if crew_timeline[m] > crew_cap:
                if not in_violation:
                    resource_conflicts += 1
                    in_violation = True
            else:
                in_violation = False

        # 3. Calculate objective score
        # Priority reward minus penalties for real-world collisions, delays, and crew violations
        base_priority_score = sum(
            b.priority.value * self.config.priority_weight_multiplier
            for b in request.block_requests
        )
        train_conflict_penalty = train_conflicts * self.config.train_conflict_penalty
        delay_penalty = total_train_delay * self.config.train_delay_penalty_per_min
        resource_penalty = resource_conflicts * self.config.resource_conflict_penalty

        naive_objective_score = float(
            base_priority_score - train_conflict_penalty - delay_penalty - resource_penalty
        )

        runtime = time.time() - start_time
        total_requested = len(request.block_requests)
        num_assets = len(request.assets)
        utilization = (total_downtime / (horizon * max(num_assets, 1))) * 100 if num_assets > 0 else 0.0

        schedule_metrics = ScheduleMetrics(
            total_blocks_requested=total_requested,
            total_blocks_scheduled=total_requested,
            total_blocks_skipped=0,
            objective_score=naive_objective_score,
            total_affected_trains=len(all_affected_trains),
            total_deviation_minutes=0,
            average_deviation_minutes=0.0,
            asset_utilization_percent=round(utilization, 2),
            solve_time_seconds=round(runtime, 4),
            solver_status="NAIVE_BASELINE",
            train_conflicts=train_conflicts,
            estimated_train_delay_minutes=total_train_delay,
            resource_conflicts=resource_conflicts,
            total_asset_downtime_minutes=total_downtime,
        )

        schedule = OptimizedSchedule(
            id=f"naive_{str(uuid.uuid4())[:8]}",
            name="Naive Baseline Maintenance Schedule (Unoptimized)",
            planning_horizon_minutes=horizon,
            created_at=datetime.now(timezone.utc).isoformat(),
            solver_config={
                "type": "naive_baseline",
                "crew_capacity": crew_cap,
                "safety_buffer_minutes": buffer,
                "disclaimer": self.config.DISCLAIMER,
            },
            blocks=scheduled_blocks,
            metrics=schedule_metrics,
            warnings=[
                f"Generated {train_conflicts} direct train conflicts with estimated {total_train_delay} min delay.",
                f"Exceeded available crew capacity ({crew_cap}) with peak demand of {max_crew_demanded} crews.",
            ],
        )

        comparison_metrics = ComparisonMetrics(
            scheduler_type="Naive Baseline (Requested Times)",
            blocks_requested=total_requested,
            blocks_scheduled=total_requested,
            blocks_skipped=0,
            train_conflicts=train_conflicts,
            estimated_train_delay_minutes=total_train_delay,
            affected_trains_count=len(all_affected_trains),
            affected_trains=sorted(list(all_affected_trains)),
            total_deviation_minutes=0,
            average_deviation_minutes=0.0,
            asset_downtime_minutes=total_downtime,
            asset_utilization_percent=round(utilization, 2),
            resource_conflicts=resource_conflicts,
            max_crews_demanded=max_crew_demanded,
            crew_capacity=crew_cap,
            objective_score=naive_objective_score,
            solver_status="UNOPTIMIZED",
            runtime_seconds=round(runtime, 4),
        )

        return schedule, comparison_metrics
