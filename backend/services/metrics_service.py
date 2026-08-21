from typing import List, Dict, Any
from backend.core.database import SessionLocal
from backend.models.orm import MetricSnapshot, SimulationSession
from backend.simulation.manager import simulation_manager

class MetricsService:
    @staticmethod
    def get_current_snapshot() -> Dict[str, Any]:
        """
        Query live step snapshot statistics.
        """
        status = simulation_manager.get_status()
        # Fetch directly from vehicle/emission aggregates
        from backend.simulation.vehicle_service import vehicle_service
        from backend.simulation.emission_service import emission_service
        
        v_metrics = vehicle_service.get_summary()
        e_metrics = emission_service.get_current_metrics()
        
        return {
            "session_id": status["session_id"],
            "step": simulation_manager.step_count,
            "simulation_time": status["simulation_time"],
            "vehicle_count": v_metrics["total_vehicles"],
            "average_speed": v_metrics["average_speed"],
            "average_waiting_time": v_metrics["average_waiting_time"],
            "total_co2": e_current_co2 := e_metrics.co2,
            "total_nox": e_metrics.nox,
            "total_fuel": e_metrics.fuel,
            "reward": float(simulation_manager.last_reward),
            "latency": float(simulation_manager.last_latency_ms)
        }

    @staticmethod
    def get_session_history(session_id: str) -> List[Dict[str, Any]]:
        db = SessionLocal()
        try:
            snapshots = db.query(MetricSnapshot).filter(MetricSnapshot.session_id == session_id).order_by(MetricSnapshot.step.asc()).all()
            return [
                {
                    "step": snap.step,
                    "simulation_time": snap.simulation_time,
                    "vehicle_count": snap.vehicle_count,
                    "average_speed": snap.average_speed,
                    "average_waiting_time": snap.average_waiting_time,
                    "total_co2": snap.total_co2,
                    "total_nox": snap.total_nox,
                    "total_fuel": snap.total_fuel,
                    "reward": snap.reward,
                    "latency": snap.latency
                }
                for snap in snapshots
            ]
        finally:
            db.close()

# Singleton Metrics Service
metrics_service = MetricsService()
