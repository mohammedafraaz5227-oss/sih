from dataclasses import dataclass


@dataclass
class SolverConfig:
    """Configuration for the CP-SAT solver and schedule evaluation."""
    max_solve_time_seconds: float = 30.0
    num_workers: int = 8
    safety_buffer_minutes: int = 15  # Buffer before/after train movements
    planning_horizon_minutes: int = 1440  # 24 hours
    crew_capacity: int = 3  # Default concurrent crew capacity if not specified in resources
    
    # Objective weights (higher = more important)
    priority_weight_multiplier: int = 10000  # Base multiplier for priority reward
    deviation_penalty_weight: int = 10       # Penalty per minute of deviation from preferred time

    # Operational violation penalties (used in evaluation and comparison metrics)
    train_conflict_penalty: int = 25000       # Penalty per direct train-block conflict
    train_delay_penalty_per_min: int = 50     # Penalty per minute of estimated train detention
    resource_conflict_penalty: int = 15000    # Penalty per over-capacity crew interval
    
    log_search_progress: bool = False
    
    # Demo disclaimer
    DISCLAIMER: str = "Safety buffer, capacities, and weights are demo assumptions, not official Indian Railways parameters."
