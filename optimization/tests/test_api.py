from fastapi.testclient import TestClient
from src.api.server import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_optimize_demo():
    response = client.post("/optimize/demo")
    assert response.status_code == 200
    data = response.json()

    assert "metrics" in data
    assert "blocks" in data
    assert data["metrics"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert len(data["blocks"]) > 0


def test_optimize_endpoint(sample_optimization_request):
    req_data = sample_optimization_request.model_dump()
    response = client.post("/optimize", json=req_data)

    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["total_blocks_requested"] == len(sample_optimization_request.block_requests)


def test_optimize_congested_endpoint():
    response = client.post("/optimize/congested")
    assert response.status_code == 200
    data = response.json()

    assert "metrics" in data
    assert "blocks" in data
    assert data["metrics"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert data["metrics"]["train_conflicts"] == 0
    assert data["metrics"]["resource_conflicts"] == 0
    assert data["metrics"]["total_blocks_scheduled"] >= 5


def test_compare_congested_endpoint():
    response = client.post("/compare/congested")
    assert response.status_code == 200
    data = response.json()

    assert "naive_plan" in data
    assert "optimized_plan" in data
    assert data["naive_plan"]["train_conflicts"] > 0
    assert data["optimized_plan"]["train_conflicts"] == 0
    assert data["improvement_summary"]["train_conflicts_eliminated"] > 0


def test_compare_endpoint(sample_optimization_request):
    req_data = sample_optimization_request.model_dump()
    response = client.post("/compare", json=req_data)
    assert response.status_code == 200
    data = response.json()

    assert "naive_plan" in data
    assert "optimized_plan" in data
    assert "improvement_summary" in data
    assert data["optimized_plan"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
