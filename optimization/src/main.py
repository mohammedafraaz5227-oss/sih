"""
CLI entry point for running the optimization engine and baseline comparison.

[DEMO MODE — All schedules and metrics are derived from synthetic demonstration data]
"""

import sys
from src.data import generate_demo_data, generate_congested_data
from src.solver import BlockPlanningEngine, ScheduleComparator, SolverConfig


def run_standard_demo():
    """Run the optimization engine on the standard demo scenario."""
    print("=" * 70)
    print("AI-Powered Block Planning — Standard Demo Scenario")
    print("[DEMO MODE — Using synthetic data only]")
    print("=" * 70)

    request = generate_demo_data()
    print(f"\nLoaded: {len(request.assets)} assets, "
          f"{len(request.trains)} trains, "
          f"{len(request.block_requests)} block requests")

    engine = BlockPlanningEngine()
    engine.build_model(request)
    print("\nRunning CP-SAT solver...")
    result = engine.solve()

    print(f"\nSolver status: {result.metrics.solver_status}")
    print(f"Solve time: {result.metrics.solve_time_seconds}s")
    print(f"Blocks scheduled: {result.metrics.total_blocks_scheduled}"
          f"/{result.metrics.total_blocks_requested}")
    print(f"Objective score: {result.metrics.objective_score}")

    print("\nScheduled Blocks:")
    for block in result.blocks:
        status = "✓ SCHEDULED" if block.is_scheduled else "✗ SKIPPED"
        if block.is_scheduled:
            sh, sm = divmod(block.scheduled_start, 60)
            eh, em = divmod(block.scheduled_end, 60)
            time_str = f"{sh:02d}:{sm:02d}-{eh:02d}:{em:02d}"
        else:
            time_str = "N/A"
        print(f"  {status} | {block.block_request_id} | "
              f"{block.maintenance_type} | P{block.priority} | "
              f"{time_str} | {block.asset_name}")

    return result


def run_congested_comparison():
    """Run both Naive Baseline and CP-SAT Optimizer on congested scenario and display comparison."""
    print("=" * 90)
    print("AI-Powered Block Planning — Milestone 1.5 Congested Scenario Benchmark")
    print("[DEMO MODE — Testing trade-offs: 11 trains, 10 blocks, tight windows, 2 crews]")
    print("=" * 90)

    request = generate_congested_data()
    print(f"\nLoaded Congested Corridor:")
    print(f"  Assets: {len(request.assets)} track sections")
    print(f"  Timetabled Trains: {len(request.trains)} train movements")
    print(f"  Block Requests: {len(request.block_requests)} maintenance tasks (P1 to P5)")
    print(f"  Maintenance Crews: {request.config.get('crew_capacity', 2)} available teams")

    config = SolverConfig(max_solve_time_seconds=30.0, safety_buffer_minutes=15)
    comparator = ScheduleComparator(config=config)
    comparison = comparator.compare(request, scenario_name="Deliberately Congested Delhi-Agra Corridor")

    # Display comparison table
    print("\n" + comparator.format_comparison_table(comparison))

    # Also run CP-SAT to output full JSON
    engine = BlockPlanningEngine(config=config)
    engine.build_model(request)
    opt_result = engine.solve()

    print("\n" + "=" * 90)
    print("CP-SAT OPTIMIZED SCHEDULE (SAMPLE JSON OUTPUT):")
    print("=" * 90)
    print(opt_result.model_dump_json(indent=2))

    return comparison, opt_result


def main():
    if "--standard" in sys.argv:
        run_standard_demo()
    else:
        run_congested_comparison()


if __name__ == "__main__":
    main()
