import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_get_health():
    with TestClient(app) as client:
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"

def test_get_optimization_status():
    with TestClient(app) as client:
        res = client.get("/api/v1/rl/status")
        assert res.status_code == 200
        data = res.json()
        assert "active_controller" in data
