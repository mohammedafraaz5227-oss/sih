from pydantic import BaseModel
from typing import Optional, Any


class ScheduledBlock(BaseModel):
    """A single maintenance block in the schedule."""
    block_request_id: str
    asset_id: str
    asset_name: str
    maintenance_type: str
    priority: int
    scheduled_start: int         # Minutes from midnight
    scheduled_end: int           # Minutes from midnight
    duration_minutes: int
    preferred_start: int
    deviation_minutes: int       # |scheduled - preferred|
    affected_trains: list[str]   # Train IDs that were considered
    is_scheduled: bool
    skip_reason: Optional[str] = None


class ScheduleMetrics(BaseModel):
    """Aggregate metrics for the schedule."""
    total_blocks_requested: int
    total_blocks_scheduled: int
    total_blocks_skipped: int
    objective_score: float
    total_affected_trains: int
    total_deviation_minutes: int
    average_deviation_minutes: float
    asset_utilization_percent: float  # % of planning horizon used for maintenance
    solve_time_seconds: float
    solver_status: str               # OPTIMAL, FEASIBLE, NAIVE_BASELINE, INFEASIBLE, etc.
    train_conflicts: int = 0
    estimated_train_delay_minutes: int = 0
    resource_conflicts: int = 0
    total_asset_downtime_minutes: int = 0


class OptimizedSchedule(BaseModel):
    """The complete output of the optimization engine.
    
    [DEMO OUTPUT — Generated from synthetic data]
    """
    id: str
    name: str
    planning_horizon_minutes: int = 1440
    created_at: str              # ISO timestamp
    solver_config: dict          # Configuration used
    blocks: list[ScheduledBlock]
    metrics: ScheduleMetrics
    warnings: list[str] = []     # Any solver warnings
    demo_disclaimer: str = "This schedule was generated using synthetic demo data and is not based on real Indian Railways operations."


class ComparisonMetrics(BaseModel):
    """Metrics for comparing baseline vs optimized plans."""
    scheduler_type: str          # "Naive Baseline" vs "CP-SAT Optimizer"
    blocks_requested: int
    blocks_scheduled: int
    blocks_skipped: int
    train_conflicts: int
    estimated_train_delay_minutes: int
    affected_trains_count: int
    affected_trains: list[str]
    total_deviation_minutes: int
    average_deviation_minutes: float
    asset_downtime_minutes: int
    asset_utilization_percent: float
    resource_conflicts: int
    max_crews_demanded: int
    crew_capacity: int
    objective_score: float
    solver_status: str
    runtime_seconds: float


class ScheduleComparison(BaseModel):
    """Side-by-side comparison of Naive Baseline Plan vs CP-SAT Optimized Plan."""
    scenario_name: str
    planning_horizon_minutes: int = 1440
    naive_plan: ComparisonMetrics
    optimized_plan: ComparisonMetrics
    improvement_summary: dict[str, Any]
    demo_disclaimer: str = "All schedules and metrics are derived from synthetic demonstration data."
