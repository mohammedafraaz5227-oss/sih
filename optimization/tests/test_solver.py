import pytest
from src.solver import BlockPlanningEngine
from src.models import OptimizationRequest, BlockRequest, MaintenanceType, BlockPriority

def test_solver_finds_feasible_solution(sample_optimization_request, solver_config):
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(sample_optimization_request)
    result = engine.solve()
    
    assert result.metrics.solver_status in ["OPTIMAL", "FEASIBLE"]
    assert result.metrics.total_blocks_scheduled > 0

def test_solver_respects_time_windows(sample_optimization_request, solver_config):
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(sample_optimization_request)
    result = engine.solve()
    
    req_dict = {b.id: b for b in sample_optimization_request.block_requests}
    for b in result.blocks:
        if b.is_scheduled:
            req = req_dict[b.block_request_id]
            assert b.scheduled_start >= req.earliest_start
            assert b.scheduled_end <= req.latest_end
            assert (b.scheduled_end - b.scheduled_start) == req.duration_minutes

def test_solver_avoids_train_conflicts(sample_optimization_request, solver_config):
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(sample_optimization_request)
    result = engine.solve()
    
    # Train 1 is on A1 from 100 to 120. Buffer is 10. So A1 blocked 90 to 130.
    for b in result.blocks:
        if b.is_scheduled and b.asset_id == "A1":
            assert not (b.scheduled_start < 130 and b.scheduled_end > 90)

def test_solver_prioritizes_high_priority(sample_assets, solver_config):
    # Two blocks competing for exact same window, exact same asset.
    reqs = [
        BlockRequest(id="B_LOW", asset_id="A1", maintenance_type=MaintenanceType.ROUTINE_INSPECTION, priority=BlockPriority.LOW, duration_minutes=60, earliest_start=0, latest_end=60, preferred_start=0),
        BlockRequest(id="B_HIGH", asset_id="A1", maintenance_type=MaintenanceType.TRACK_RENEWAL, priority=BlockPriority.HIGH, duration_minutes=60, earliest_start=0, latest_end=60, preferred_start=0),
    ]
    opt_req = OptimizationRequest(assets=sample_assets, trains=[], block_requests=reqs)
    
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(opt_req)
    result = engine.solve()
    
    # Only one can fit. Should be B_HIGH.
    scheduled = [b.block_request_id for b in result.blocks if b.is_scheduled]
    assert "B_HIGH" in scheduled
    assert "B_LOW" not in scheduled

def test_solver_handles_empty_input(solver_config):
    opt_req = OptimizationRequest(assets=[], trains=[], block_requests=[])
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(opt_req)
    result = engine.solve()
    
    assert result.metrics.total_blocks_requested == 0
    assert result.metrics.solver_status in ["OPTIMAL", "FEASIBLE"]

def test_solver_objective_is_positive(sample_optimization_request, solver_config):
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(sample_optimization_request)
    result = engine.solve()
    if result.metrics.total_blocks_scheduled > 0:
        assert result.metrics.objective_score > 0

def test_solver_multiple_blocks_same_section(sample_assets, solver_config):
    reqs = [
        BlockRequest(id="B1", asset_id="A1", maintenance_type=MaintenanceType.ROUTINE_INSPECTION, priority=BlockPriority.LOW, duration_minutes=60, earliest_start=0, latest_end=120, preferred_start=0),
        BlockRequest(id="B2", asset_id="A1", maintenance_type=MaintenanceType.ROUTINE_INSPECTION, priority=BlockPriority.LOW, duration_minutes=60, earliest_start=0, latest_end=120, preferred_start=60),
    ]
    opt_req = OptimizationRequest(assets=sample_assets, trains=[], block_requests=reqs)
    engine = BlockPlanningEngine(config=solver_config)
    engine.build_model(opt_req)
    result = engine.solve()
    
    assert result.metrics.total_blocks_scheduled == 2
    # Ensure they don't overlap
    b1 = next(b for b in result.blocks if b.block_request_id == "B1")
    b2 = next(b for b in result.blocks if b.block_request_id == "B2")
    assert b1.scheduled_end <= b2.scheduled_start or b2.scheduled_end <= b1.scheduled_start
