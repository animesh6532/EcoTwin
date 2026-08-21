import pytest
import numpy as np
from fastapi.testclient import TestClient
from backend.main import app
from backend.simulation.manager import simulation_manager
from backend.simulation.vehicle_service import vehicle_service
from backend.simulation.emission_service import emission_service
from backend.rl.observation_builder import ObservationBuilder
from backend.rl.ppo_service import PPOService
from backend.simulation.traffic_light_controller import TrafficLightController
from backend.core.database import SessionLocal
from backend.models.orm import SimulationSession, MetricSnapshot

def test_full_backend_simulation_flow():
    """
    Core End-to-End Integration Test scenario:
    1. Start FastAPI TestClient (using context manager to fire startup hooks)
    2. Start SUMO Simulation through SimulationManager with PPO controller
    3. Verify session is registered in DB
    4. Advance simulation steps
    5. Collect vehicles and emissions
    6. Build observation (8D vector)
    7. PPO policy predicts phase action
    8. Apply traffic phase action
    9. Verify snapshot is recorded in DB
    10. Stop simulation safely
    """
    with TestClient(app) as client:
        # 1. Start simulation through endpoint
        start_payload = {
            "scenario": "training",
            "gui": False,
            "duration": 5,
            "step_length": 1.0,
            "controller": "ppo"
        }
        response = client.post("/api/v1/simulation/start", json=start_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["running"] is True
        assert data["controller"] == "ppo"
        session_id = data["session_id"]
        assert session_id is not None
        
        # 2. Verify Session exists in DB
        db = SessionLocal()
        try:
            session = db.query(SimulationSession).filter(SimulationSession.session_id == session_id).first()
            assert session is not None
            assert session.status == "running"
            assert session.controller == "ppo"
        finally:
            db.close()
            
        # 3. Advance simulation step
        step_resp = client.post("/api/v1/simulation/step")
        assert step_resp.status_code == 200
        step_data = step_resp.json()
        assert step_data["simulation_time"] == 1.0
        
        # 4. Collect vehicles via endpoint
        veh_resp = client.get("/api/v1/vehicles")
        assert veh_resp.status_code == 200
        vehicles = veh_resp.json()
        assert isinstance(vehicles, list)
        
        # 5. Collect emissions and grid summary via endpoint
        emissions_resp = client.get("/api/v1/emissions/current")
        assert emissions_resp.status_code == 200
        emissions = emissions_resp.json()
        assert "co2" in emissions
        
        summary_resp = client.get("/api/v1/emissions/summary")
        assert summary_resp.status_code == 200
        grid_cells = summary_resp.json()
        assert isinstance(grid_cells, list)
        
        # 6. Verify observation building (8D)
        obs_builder = ObservationBuilder()
        obs = obs_builder.build_observation("center")
        assert obs.shape == (8,)
        assert obs.dtype == np.float32
        
        # 7. Verify PPO service prediction action
        ppo_service = PPOService()
        action = ppo_service.get_action(obs)
        assert action >= 0 and action <= 3
        
        # 8. Verify traffic light phase execution
        success = TrafficLightController.apply_action("center", action)
        assert success is True
        
        # 9. Verify MetricSnapshot is committed to Database
        db = SessionLocal()
        try:
            snapshot = db.query(MetricSnapshot).filter(MetricSnapshot.session_id == session_id).first()
            assert snapshot is not None
            assert snapshot.step == 1
            assert snapshot.vehicle_count >= 0
        finally:
            db.close()
            
        # 10. Stop simulation safely
        stop_resp = client.post("/api/v1/simulation/stop")
        assert stop_resp.status_code == 200
        stop_data = stop_resp.json()
        assert stop_data["running"] is False
        
        # Verify session completed status in DB
        db = SessionLocal()
        try:
            session = db.query(SimulationSession).filter(SimulationSession.session_id == session_id).first()
            assert session.status == "stopped"
        finally:
            db.close()
