import pytest
from src.models import (
    Asset, AssetType, TrainMovement, SectionMovement, TrainType,
    BlockRequest, MaintenanceType, BlockPriority, OptimizationRequest
)
from src.solver import SolverConfig

@pytest.fixture
def sample_assets():
    return [
        Asset(id="A1", name="Track 1", asset_type=AssetType.TRACK_SECTION, line="L1", zone="Z1", division="D1", start_km=0, end_km=10),
        Asset(id="A2", name="Track 2", asset_type=AssetType.TRACK_SECTION, line="L1", zone="Z1", division="D1", start_km=10, end_km=20),
        Asset(id="A3", name="Track 3", asset_type=AssetType.TRACK_SECTION, line="L1", zone="Z1", division="D1", start_km=20, end_km=30),
    ]

@pytest.fixture
def sample_trains():
    return [
        TrainMovement(id="T1", train_number="1001", name="Train A", train_type=TrainType.EXPRESS, priority=1, sections=[
            SectionMovement(asset_id="A1", entry_time=100, exit_time=120),
            SectionMovement(asset_id="A2", entry_time=120, exit_time=140),
        ]),
        TrainMovement(id="T2", train_number="1002", name="Train B", train_type=TrainType.FREIGHT, priority=5, sections=[
            SectionMovement(asset_id="A2", entry_time=200, exit_time=230),
            SectionMovement(asset_id="A3", entry_time=230, exit_time=260),
        ]),
        TrainMovement(id="T3", train_number="1003", name="Train C", train_type=TrainType.PASSENGER, priority=3, sections=[
            SectionMovement(asset_id="A1", entry_time=300, exit_time=320),
            SectionMovement(asset_id="A3", entry_time=320, exit_time=340),
        ]),
    ]

@pytest.fixture
def sample_block_requests():
    return [
        BlockRequest(id="B1", asset_id="A1", maintenance_type=MaintenanceType.ROUTINE_INSPECTION, priority=BlockPriority.LOW, duration_minutes=60, earliest_start=0, latest_end=300, preferred_start=20),
        BlockRequest(id="B2", asset_id="A2", maintenance_type=MaintenanceType.TRACK_RENEWAL, priority=BlockPriority.HIGH, duration_minutes=120, earliest_start=0, latest_end=400, preferred_start=250),
        BlockRequest(id="B3", asset_id="A3", maintenance_type=MaintenanceType.EMERGENCY_REPAIR, priority=BlockPriority.EMERGENCY, duration_minutes=40, earliest_start=200, latest_end=280, preferred_start=220),
        BlockRequest(id="B4", asset_id="A1", maintenance_type=MaintenanceType.ROUTINE_INSPECTION, priority=BlockPriority.MEDIUM, duration_minutes=60, earliest_start=150, latest_end=280, preferred_start=200),
    ]

@pytest.fixture
def sample_optimization_request(sample_assets, sample_trains, sample_block_requests):
    return OptimizationRequest(assets=sample_assets, trains=sample_trains, block_requests=sample_block_requests)

@pytest.fixture
def solver_config():
    return SolverConfig(max_solve_time_seconds=2.0, num_workers=1, safety_buffer_minutes=10)
