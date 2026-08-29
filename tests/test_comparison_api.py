import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import SessionLocal
from backend.models.orm import SimulationSession, MetricSnapshot
from datetime import datetime

def test_comparison_invalid_uuid():
    with TestClient(app) as client:
        # Invalid format
        response = client.get("/api/v1/analysis/compare?ppo_session=invalid-format&baseline_session=ca751717-38ee-4b92-a1f7-e4359cd4852c")
        assert response.status_code == 422
        assert "UUID format" in response.json()["detail"]

def test_comparison_missing_uuid():
    with TestClient(app) as client:
        response = client.get("/api/v1/analysis/compare?ppo_session=&baseline_session=ca751717-38ee-4b92-a1f7-e4359cd4852c")
        # FastAPI returns 422 for missing query params if they're required, or 400 if validation is triggered
        assert response.status_code in [400, 422]

def test_comparison_run_not_found():
    with TestClient(app) as client:
        # Valid format but non-existent
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/analysis/compare?ppo_session={fake_uuid}&baseline_session=ca751717-38ee-4b92-a1f7-e4359cd4852c")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"]

def test_comparison_run_not_completed():
    db = SessionLocal()
    running_id = "11111111-1111-1111-1111-111111111111"
    try:
        # Create a mock running session
        session = SimulationSession(
            session_id=running_id,
            started_at=datetime.utcnow(),
            scenario="normal",
            controller="ppo",
            status="running"
        )
        db.add(session)
        db.commit()
        
        with TestClient(app) as client:
            response = client.get(f"/api/v1/analysis/compare?ppo_session={running_id}&baseline_session=ca751717-38ee-4b92-a1f7-e4359cd4852c")
            assert response.status_code == 409
            assert "not completed" in response.json()["detail"]
    finally:
        # Clean up
        session_to_del = db.query(SimulationSession).filter(SimulationSession.session_id == running_id).first()
        if session_to_del:
            db.delete(session_to_del)
            db.commit()
        db.close()

def test_comparison_different_scenarios():
    db = SessionLocal()
    training_id = "22222222-2222-2222-2222-222222222222"
    try:
        # Create a mock session with 'training' scenario
        session = SimulationSession(
            session_id=training_id,
            started_at=datetime.utcnow(),
            scenario="training",
            controller="ppo",
            status="completed"
        )
        db.add(session)
        db.commit()
        
        with TestClient(app) as client:
            # Compared against baseline which has scenario 'normal'
            response = client.get(f"/api/v1/analysis/compare?ppo_session={training_id}&baseline_session=ca751717-38ee-4b92-a1f7-e4359cd4852c")
            assert response.status_code == 400
            assert "simulation scenarios" in response.json()["detail"]
    finally:
        session_to_del = db.query(SimulationSession).filter(SimulationSession.session_id == training_id).first()
        if session_to_del:
            db.delete(session_to_del)
            db.commit()
        db.close()

def test_successful_demo_comparison():
    with TestClient(app) as client:
        # Fetch demo run ids
        demo_resp = client.get("/api/v1/analysis/demo-comparison")
        assert demo_resp.status_code == 200
        demo_data = demo_resp.json()
        ppo_id = demo_data["ppo_run_id"]
        baseline_id = demo_data["baseline_run_id"]
        
        # Compare them
        compare_resp = client.get(f"/api/v1/analysis/compare?ppo_session={ppo_id}&baseline_session={baseline_id}")
        assert compare_resp.status_code == 200
        compare_data = compare_resp.json()
        assert compare_data["session_ppo"] == ppo_id
        assert compare_data["session_baseline"] == baseline_id
        assert len(compare_data["metrics"]) == 5
        
        # Validate that NOx emissions exist in output
        metrics_dict = {m["metric"]: m for m in compare_data["metrics"]}
        assert "NOx Emissions" in metrics_dict
        assert "CO2 Emissions" in metrics_dict
        assert "Average Waiting Time" in metrics_dict
        assert "Average Speed" in metrics_dict
        assert "Fuel Consumption" in metrics_dict
