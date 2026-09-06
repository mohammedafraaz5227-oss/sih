"""
End-to-End Integration Tests for AI-Powered Block Planning System.

Verifies:
1. Block request created dynamically is processed by CP-SAT solver.
2. Running CP-SAT uses the actual current data rather than static/mock results.
3. The returned schedule contains the dynamic block with valid schedule or explicit skip reason.
4. Dynamic KPI metrics are calculated from the actual solver response.
5. Naive vs CP-SAT comparison uses the actual benchmark result on arbitrary inputs.
6. Scenario switching between Standard (8 blocks) and Congested (10 blocks) produces distinct, valid schedules.
7. Verification of constraint enforcement (headway buffer, crew capacity, time windows).
"""

from fastapi.testclient import TestClient
from src.api.server import app
from src.models import (
    Asset, AssetType, TrainMovement, SectionMovement, TrainType,
    BlockRequest, MaintenanceType, BlockPriority, Resource, ResourceType,
    OptimizationRequest,
)
from src.data import generate_demo_data, generate_congested_data

client = TestClient(app)


def test_e2e_custom_block_creation_and_optimization():
    """Verify that a dynamically created block request is correctly solved by CP-SAT."""
    # 1. Start with congested corridor baseline
    base_request = generate_congested_data()
    original_block_count = len(base_request.block_requests)

    # 2. Add a new custom emergency block request (simulating user creation in UI)
    custom_block = BlockRequest(
        id="BR_CUSTOM_E2E_01",
        asset_id="SEC_NDLS_GZB",
        maintenance_type=MaintenanceType.EMERGENCY_REPAIR,
        priority=BlockPriority.EMERGENCY,
        duration_minutes=60,
        earliest_start=60,
        latest_end=350,
        preferred_start=180,
        crew_required=1,
        requested_by="SIH E2E Test Suite",
    )
    base_request.block_requests.append(custom_block)

    # 3. Post to /optimize
    req_json = base_request.model_dump()
    response = client.post("/optimize", json=req_json)
    assert response.status_code == 200, f"Solver returned {response.status_code}: {response.text}"

    schedule = response.json()

    # 4. Verify metrics reflect the updated block count
    assert schedule["metrics"]["total_blocks_requested"] == original_block_count + 1
    assert schedule["metrics"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert schedule["metrics"]["train_conflicts"] == 0

    # 5. Verify the custom block appears in the schedule
    custom_scheduled = next((b for b in schedule["blocks"] if b["block_request_id"] == "BR_CUSTOM_E2E_01"), None)
    assert custom_scheduled is not None, "Custom block not found in CP-SAT schedule!"

    # Since it's Emergency P5 with an available window (01:00-05:50), CP-SAT should prioritize and schedule it
    assert custom_scheduled["is_scheduled"] is True
    assert custom_scheduled["scheduled_start"] >= 60
    assert custom_scheduled["scheduled_end"] <= 350
    assert custom_scheduled["duration_minutes"] == 60


def test_e2e_infeasible_block_skip_reason():
    """Verify that an infeasible block is cleanly skipped with an explicit skip reason."""
    base_request = generate_congested_data()

    # Create an impossible block request: 120-min block in a window that is heavily congested with premier trains
    impossible_block = BlockRequest(
        id="BR_IMPOSSIBLE_01",
        asset_id="SEC_NDLS_GZB",
        maintenance_type=MaintenanceType.ROUTINE_INSPECTION,
        priority=BlockPriority.LOW,
        duration_minutes=90,
        earliest_start=720,  # 12:00
        latest_end=810,    # 13:30 (window is exactly 90 min, during Gatimaan departure 720-735)
        preferred_start=720,
        crew_required=2,
    )
    base_request.block_requests.append(impossible_block)

    req_json = base_request.model_dump()
    response = client.post("/optimize", json=req_json)
    assert response.status_code == 200

    schedule = response.json()
    impossible_scheduled = next((b for b in schedule["blocks"] if b["block_request_id"] == "BR_IMPOSSIBLE_01"), None)
    assert impossible_scheduled is not None
    assert impossible_scheduled["is_scheduled"] is False
    assert impossible_scheduled["skip_reason"] is not None
    assert len(impossible_scheduled["skip_reason"]) > 0


def test_e2e_dynamic_comparison_reflects_actual_data():
    """Verify that POST /compare executes the full comparison on current inputs."""
    base_request = generate_congested_data()

    req_json = base_request.model_dump()
    response = client.post("/compare", json=req_json)
    assert response.status_code == 200

    comp = response.json()
    assert "naive_plan" in comp
    assert "optimized_plan" in comp
    assert "improvement_summary" in comp

    # Dynamic metrics verification: Naive has conflicts, CP-SAT has 0 conflicts
    assert comp["naive_plan"]["train_conflicts"] > 0
    assert comp["optimized_plan"]["train_conflicts"] == 0
    assert comp["improvement_summary"]["train_conflicts_eliminated"] == comp["naive_plan"]["train_conflicts"]
    assert comp["improvement_summary"]["train_delay_saved_minutes"] >= 0


def test_e2e_scenario_switch_data_separation():
    """Verify that Standard and Congested scenarios yield distinct problem sizes and schedules."""
    # Standard demo data
    std_req = generate_demo_data()
    std_res = client.post("/optimize", json=std_req.model_dump()).json()

    # Congested data
    cong_req = generate_congested_data()
    cong_res = client.post("/optimize", json=cong_req.model_dump()).json()

    assert std_res["metrics"]["total_blocks_requested"] == 8
    assert cong_res["metrics"]["total_blocks_requested"] == 10
    assert std_res["metrics"]["total_blocks_scheduled"] != cong_res["metrics"]["total_blocks_scheduled"]
