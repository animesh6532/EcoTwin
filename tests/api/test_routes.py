import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_get_optimization_status():
    res = client.get("/api/optimization/status")
    assert res.status_code == 200
    data = res.json()
    assert "active_controller" in data
