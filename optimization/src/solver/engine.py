import time
from datetime import datetime, timezone
import uuid

from ortools.sat.python import cp_model
from ortools.sat.python.cp_model import CpModel, CpSolver

from src.models import (
    OptimizationRequest, 
    BlockRequest, 
    TrainMovement, 
    Asset, 
    ScheduledBlock, 
    ScheduleMetrics, 
    OptimizedSchedule
)
from src.solver.config import SolverConfig

class BlockPlanningEngine:
    """CP-SAT based optimization engine for railway maintenance block scheduling.
    
    Uses Google OR-Tools CP-SAT solver to find optimal maintenance block
    schedules that minimize conflicts with train operations.
    """
    
    def __init__(self, config: SolverConfig = None):
        self.config = config or SolverConfig()
        self.model = CpModel()
        self.solver = CpSolver()
        # Internal tracking
        self._block_vars: dict[str, dict] = {}  # block_id -> {start, end, presence, interval}
        self._section_intervals: dict[str, list] = {}  # asset_id -> list of intervals
        self._train_movements: list[TrainMovement] = []  # Track train data for result analysis
        self._assets: dict[str, Asset] = {}  # asset_id -> Asset
    
    def build_model(self, request: OptimizationRequest) -> None:
        """Build the complete CP-SAT model from an optimization request."""
        # Store assets for later reference
        self._assets = {a.id: a for a in request.assets}
        
        # Determine crew capacity from resources or config
        crew_cap = request.config.get("crew_capacity", self.config.crew_capacity)
        if request.resources:
            from src.models import ResourceType
            res_crews = sum(r.capacity for r in request.resources if r.resource_type == ResourceType.CREW)
            if res_crews > 0:
                crew_cap = res_crews
        self._crew_capacity = crew_cap
        
        # 1. Add train movements as fixed intervals (with safety buffer)
        self._add_train_intervals(request.trains)
        
        # 2. Add maintenance block variables and intervals
        self._add_block_variables(request.block_requests)
        
        # 3. Add no-overlap constraints per track section
        self._add_no_overlap_constraints()
        
        # 4. Add resource capacity constraints
        self._add_resource_constraints(request.block_requests)
        
        # 5. Build objective function
        self._build_objective(request.block_requests)
    
    def _add_train_intervals(self, trains: list[TrainMovement]):
        """Add fixed interval variables for train movements with safety buffers."""
        buffer = self.config.safety_buffer_minutes
        horizon = self.config.planning_horizon_minutes
        
        for train in trains:
            self._train_movements.append(train)
            for section in train.sections:
                asset_id = section.asset_id
                self._section_intervals.setdefault(asset_id, [])
                
                # Apply safety buffer, clamped to horizon
                buffered_start = max(0, section.entry_time - buffer)
                buffered_end = min(horizon, section.exit_time + buffer)
                duration = buffered_end - buffered_start
                
                if duration <= 0:
                    continue
                
                interval = self.model.NewFixedSizeIntervalVar(
                    buffered_start, duration,
                    f"train_{train.id}_{asset_id}_{buffered_start}"
                )
                self._section_intervals[asset_id].append(interval)
    
    def _add_block_variables(self, blocks: list[BlockRequest]):
        """Create decision variables for each maintenance block request."""
        for block in blocks:
            asset_id = block.asset_id
            self._section_intervals.setdefault(asset_id, [])
            
            # Start time variable bounded by time window
            max_start = block.latest_end - block.duration_minutes
            start_var = self.model.NewIntVar(
                block.earliest_start, max_start, f"start_{block.id}"
            )
            
            # End time variable
            end_var = self.model.NewIntVar(
                block.earliest_start + block.duration_minutes,
                block.latest_end,
                f"end_{block.id}"
            )
            
            # Presence variable (optional — allows solver to skip low-priority blocks)
            presence_var = self.model.NewBoolVar(f"present_{block.id}")
            
            # Optional interval variable
            interval_var = self.model.NewOptionalIntervalVar(
                start_var, block.duration_minutes, end_var,
                presence_var, f"interval_{block.id}"
            )
            
            self._block_vars[block.id] = {
                "start": start_var,
                "end": end_var,
                "presence": presence_var,
                "interval": interval_var,
                "block": block,
            }
            
            # Register on the track section
            self._section_intervals[asset_id].append(interval_var)
    
    def _add_no_overlap_constraints(self):
        """Add disjunctive (no-overlap) constraints per track section."""
        for asset_id, intervals in self._section_intervals.items():
            if len(intervals) > 1:
                self.model.AddNoOverlap(intervals)
    
    def _add_resource_constraints(self, blocks: list[BlockRequest]):
        """Add cumulative resource constraints for maintenance crews."""
        intervals = []
        demands = []
        for block in blocks:
            if block.id in self._block_vars:
                intervals.append(self._block_vars[block.id]["interval"])
                demands.append(block.crew_required)
        
        if intervals:
            self.model.AddCumulative(intervals, demands, self._crew_capacity)
    
    def _build_objective(self, blocks: list[BlockRequest]):
        """Build the weighted objective function.

        Components:
        - REWARD: Schedule high-priority blocks (priority × multiplier × presence)
        - PENALTY: Deviation from preferred start time (conditional on scheduling)

        Uses OnlyEnforceIf to make deviation constraints conditional on presence,
        avoiding conflicts with optional interval variables.
        """
        objective_terms = []

        for block in blocks:
            if block.id not in self._block_vars:
                continue
            bvars = self._block_vars[block.id]
            priority_weight = block.priority.value * self.config.priority_weight_multiplier

            # REWARD: Schedule high-priority blocks
            objective_terms.append(priority_weight * bvars["presence"])

            # PENALTY: Deviation from preferred start time
            # Only enforce when block is present
            horizon = self.config.planning_horizon_minutes
            deviation = self.model.NewIntVar(0, horizon, f"dev_{block.id}")

            # When present: deviation = |start - preferred_start|
            # Split into two conditional constraints for the absolute value
            diff_pos = self.model.NewIntVar(0, horizon, f"diff_pos_{block.id}")
            diff_neg = self.model.NewIntVar(0, horizon, f"diff_neg_{block.id}")

            self.model.Add(
                diff_pos >= bvars["start"] - block.preferred_start
            ).OnlyEnforceIf(bvars["presence"])
            self.model.Add(
                diff_neg >= block.preferred_start - bvars["start"]
            ).OnlyEnforceIf(bvars["presence"])
            self.model.Add(
                deviation >= diff_pos
            ).OnlyEnforceIf(bvars["presence"])
            self.model.Add(
                deviation >= diff_neg
            ).OnlyEnforceIf(bvars["presence"])

            # When absent: deviation = 0
            self.model.Add(deviation == 0).OnlyEnforceIf(bvars["presence"].Not())

            objective_terms.append(
                -self.config.deviation_penalty_weight * deviation
            )

        if objective_terms:
            self.model.Maximize(sum(objective_terms))
    
    def solve(self) -> OptimizedSchedule:
        """Run the CP-SAT solver and extract results."""
        self.solver.parameters.max_time_in_seconds = self.config.max_solve_time_seconds
        self.solver.parameters.num_search_workers = self.config.num_workers
        self.solver.parameters.log_search_progress = self.config.log_search_progress
        
        start_time = time.time()
        status = self.solver.Solve(self.model)
        solve_time = time.time() - start_time
        
        status_name = self.solver.StatusName(status)
        
        scheduled_blocks = []
        total_deviation = 0
        scheduled_count = 0
        
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for block_id, vars in self._block_vars.items():
                block = vars["block"]
                is_scheduled = self.solver.BooleanValue(vars["presence"])
                
                asset = self._assets.get(block.asset_id)
                asset_name = asset.name if asset else "Unknown Asset"
                
                if is_scheduled:
                    start = self.solver.Value(vars["start"])
                    end = self.solver.Value(vars["end"])
                    deviation = abs(start - block.preferred_start)
                    total_deviation += deviation
                    scheduled_count += 1
                    
                    affected = self._find_affected_trains(block.asset_id, start, end)
                    
                    scheduled_blocks.append(ScheduledBlock(
                        block_request_id=block.id,
                        asset_id=block.asset_id,
                        asset_name=asset_name,
                        maintenance_type=block.maintenance_type.value,
                        priority=block.priority.value,
                        scheduled_start=start,
                        scheduled_end=end,
                        duration_minutes=block.duration_minutes,
                        preferred_start=block.preferred_start,
                        deviation_minutes=deviation,
                        affected_trains=affected,
                        is_scheduled=True,
                    ))
                else:
                    scheduled_blocks.append(ScheduledBlock(
                        block_request_id=block.id,
                        asset_id=block.asset_id,
                        asset_name=asset_name,
                        maintenance_type=block.maintenance_type.value,
                        priority=block.priority.value,
                        scheduled_start=-1,
                        scheduled_end=-1,
                        duration_minutes=block.duration_minutes,
                        preferred_start=block.preferred_start,
                        deviation_minutes=0,
                        affected_trains=[],
                        is_scheduled=False,
                        skip_reason="Could not schedule without violating constraints",
                    ))
        else:
            for block_id, vars in self._block_vars.items():
                block = vars["block"]
                asset = self._assets.get(block.asset_id)
                asset_name = asset.name if asset else "Unknown Asset"
                scheduled_blocks.append(ScheduledBlock(
                    block_request_id=block.id,
                    asset_id=block.asset_id,
                    asset_name=asset_name,
                    maintenance_type=block.maintenance_type.value,
                    priority=block.priority.value,
                    scheduled_start=-1,
                    scheduled_end=-1,
                    duration_minutes=block.duration_minutes,
                    preferred_start=block.preferred_start,
                    deviation_minutes=0,
                    affected_trains=[],
                    is_scheduled=False,
                    skip_reason=f"Solver returned {status_name}",
                ))
        
        total_requested = len(self._block_vars)
        total_affected = len(set(t for b in scheduled_blocks for t in b.affected_trains))
        horizon = self.config.planning_horizon_minutes
        maintenance_minutes = sum(b.duration_minutes for b in scheduled_blocks if b.is_scheduled)
        num_assets = len(self._section_intervals)
        utilization = (maintenance_minutes / (horizon * max(num_assets, 1))) * 100 if num_assets > 0 else 0
        
        metrics = ScheduleMetrics(
            total_blocks_requested=total_requested,
            total_blocks_scheduled=scheduled_count,
            total_blocks_skipped=total_requested - scheduled_count,
            objective_score=float(self.solver.ObjectiveValue()) if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) else 0.0,
            total_affected_trains=total_affected,
            total_deviation_minutes=total_deviation,
            average_deviation_minutes=total_deviation / max(scheduled_count, 1) if scheduled_count > 0 else 0.0,
            asset_utilization_percent=round(utilization, 2),
            solve_time_seconds=round(solve_time, 4),
            solver_status=status_name,
            train_conflicts=0,
            estimated_train_delay_minutes=0,
            resource_conflicts=0,
            total_asset_downtime_minutes=maintenance_minutes,
        )
        
        schedule_id = str(uuid.uuid4())[:8]
        return OptimizedSchedule(
            id=f"schedule_{schedule_id}",
            name="Optimized Maintenance Block Schedule",
            created_at=datetime.now(timezone.utc).isoformat(),
            solver_config={
                "max_solve_time_seconds": self.config.max_solve_time_seconds,
                "safety_buffer_minutes": self.config.safety_buffer_minutes,
                "priority_weight_multiplier": self.config.priority_weight_multiplier,
                "deviation_penalty_weight": self.config.deviation_penalty_weight,
                "disclaimer": self.config.DISCLAIMER,
            },
            blocks=scheduled_blocks,
            metrics=metrics,
        )
    
    def _find_affected_trains(self, asset_id: str, block_start: int, block_end: int) -> list[str]:
        """Find trains that use the same asset during the block window (without buffer)."""
        affected = []
        for train in self._train_movements:
            for section in train.sections:
                if section.asset_id == asset_id:
                    if section.entry_time < block_end and section.exit_time > block_start:
                        affected.append(f"{train.train_number} ({train.name})")
                        break
        return affected
