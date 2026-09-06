import pytest
from pydantic import ValidationError
from src.models import (
    Asset, AssetType, TrainMovement, SectionMovement, TrainType,
    BlockRequest, MaintenanceType, BlockPriority, ScheduledBlock, OptimizedSchedule, ScheduleMetrics
)

def test_asset_creation():
    asset = Asset(id="A1", name="Test", asset_type=AssetType.TRACK_SECTION, line="L1", zone="Z1", division="D1", start_km=0, end_km=10)
    assert asset.id == "A1"
    assert asset.asset_type == "track_section"

def test_train_movement_validation():
    with pytest.raises(ValidationError):
        SectionMovement(asset_id="A1", entry_time=100, exit_time=50)  # exit < entry
    
    sec = SectionMovement(asset_id="A1", entry_time=100, exit_time=150)
    train = TrainMovement(id="T1", train_number="123", name="Test Train", train_type=TrainType.EXPRESS, priority=1, sections=[sec])
    assert len(train.sections) == 1

def test_block_request_validation():
    # Valid
    BlockRequest(id="B1", asset_id="A1", maintenance_type=MaintenanceType.TRACK_RENEWAL, priority=BlockPriority.LOW, duration_minutes=60, earliest_start=0, latest_end=200, preferred_start=100)
    
    # Invalid time window
    with pytest.raises(ValidationError):
        BlockRequest(id="B1", asset_id="A1", maintenance_type=MaintenanceType.TRACK_RENEWAL, priority=BlockPriority.LOW, duration_minutes=60, earliest_start=200, latest_end=100, preferred_start=150)
        
    # Duration doesn't fit
    with pytest.raises(ValidationError):
        BlockRequest(id="B1", asset_id="A1", maintenance_type=MaintenanceType.TRACK_RENEWAL, priority=BlockPriority.LOW, duration_minutes=200, earliest_start=0, latest_end=100, preferred_start=50)

def test_optimized_schedule_serialization():
    block = ScheduledBlock(block_request_id="B1", asset_id="A1", asset_name="Test", maintenance_type="track_renewal", priority=1, scheduled_start=10, scheduled_end=70, duration_minutes=60, preferred_start=10, deviation_minutes=0, affected_trains=[], is_scheduled=True)
    metrics = ScheduleMetrics(total_blocks_requested=1, total_blocks_scheduled=1, total_blocks_skipped=0, objective_score=100.0, total_affected_trains=0, total_deviation_minutes=0, average_deviation_minutes=0.0, asset_utilization_percent=1.0, solve_time_seconds=0.1, solver_status="OPTIMAL")
    sched = OptimizedSchedule(id="S1", name="Test Schedule", created_at="2023-01-01T00:00:00Z", solver_config={}, blocks=[block], metrics=metrics)
    
    json_data = sched.model_dump_json()
    assert "S1" in json_data
    
    loaded = OptimizedSchedule.model_validate_json(json_data)
    assert loaded.id == "S1"
    assert len(loaded.blocks) == 1
