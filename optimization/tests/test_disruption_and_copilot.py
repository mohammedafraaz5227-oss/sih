import pytest
from fastapi.testclient import TestClient
from src.api.server import app
from src.copilot import parse_nlp_requisition, simulate_corridor_disruption
from src.models import DisruptionSimulationRequest

client = TestClient(app)

def test_nlp_parser_extracts_rail_grinding():
    text = "Need 3 hours near Aligarh for emergency rail grinding tomorrow at 2 PM with 2 crews"
    resp = parse_nlp_requisition(text)
    
    assert resp.confidence >= 0.9
    block = resp.parsed_block
    assert block["asset_id"] == "SEC_ALG_TDK"
    assert block["maintenance_type"] == "rail_grinding"
    assert block["duration_minutes"] == 180
    assert block["crew_required"] == 2
    assert block["priority"] in [4, 5]
    assert "rail grinding" in resp.natural_explanation.lower()

def test_nlp_parser_hindi_terms_and_ohe():
    text = "Mathura mein OHE catenary wire repair ke liye 2 ghante chahiye subah 8 baje"
    resp = parse_nlp_requisition(text)
    
    block = resp.parsed_block
    assert block["asset_id"] == "SEC_MTJ_AGC"
    assert block["maintenance_type"] == "ohe_maintenance"
    assert block["duration_minutes"] == 120
    assert block["preferred_start"] == 480
    assert block["requires_power_block"] is True

def test_disruption_simulation_train_delay():
    req = DisruptionSimulationRequest(
        scenario="congested",
        disruption_type="train_delay",
        train_id="TRN_12301",
        delay_minutes=45,
    )
    resp = simulate_corridor_disruption(req)
    
    assert resp.status == "success"
    assert "Rajdhani" in resp.disruption_applied or "12301" in resp.disruption_applied
    assert resp.cascading_delay_prevented_minutes > 0
    assert len(resp.trains_saved_from_delay) > 0
    assert resp.reoptimized_schedule.metrics.solver_status in ["OPTIMAL", "FEASIBLE"]
    assert resp.reoptimized_schedule.metrics.total_blocks_scheduled > 0

def test_disruption_simulation_emergency_block():
    req = DisruptionSimulationRequest(
        scenario="congested",
        disruption_type="emergency_block",
        emergency_asset_id="SEC_ALG_TDK",
        emergency_duration=120,
    )
    resp = simulate_corridor_disruption(req)
    
    assert resp.status == "success"
    assert "Emergency Rail Fracture" in resp.disruption_applied
    assert resp.reoptimized_schedule.metrics.solver_status in ["OPTIMAL", "FEASIBLE"]

def test_api_disruption_endpoint():
    payload = {
        "scenario": "congested",
        "disruption_type": "train_delay",
        "train_id": "TRN_12301",
        "delay_minutes": 45
    }
    response = client.post("/api/disruption/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "reoptimized_schedule" in data

def test_api_nlp_parse_endpoint():
    payload = {
        "text": "Urgent track renewal at Tundla for 4 hours tomorrow morning"
    }
    response = client.post("/api/nlp/parse", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["parsed_block"]["asset_id"] == "SEC_TDK_MTJ"
    assert data["parsed_block"]["maintenance_type"] == "track_renewal"
