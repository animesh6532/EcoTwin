from typing import Dict, Any
from backend.core.database import SessionLocal
from backend.models.orm import MetricSnapshot, SimulationSession

class AnalyticsService:
    @staticmethod
    def compare_runs(ppo_session_id: str, baseline_session_id: str) -> Dict[str, Any]:
        """
        Compare PPO optimization run vs Fixed-time baseline run.
        """
        db = SessionLocal()
        try:
            # Query last snapshots for both sessions
            ppo_snap = db.query(MetricSnapshot).filter(MetricSnapshot.session_id == ppo_session_id).order_by(MetricSnapshot.step.desc()).first()
            base_snap = db.query(MetricSnapshot).filter(MetricSnapshot.session_id == baseline_session_id).order_by(MetricSnapshot.step.desc()).first()
            
            if not ppo_snap or not base_snap:
                raise ValueError("One or both simulation sessions do not contain metric snapshots in database.")
                
            co2_imp = ((base_snap.total_co2 - ppo_snap.total_co2) / (base_snap.total_co2 or 1.0)) * 100.0
            wait_imp = ((base_snap.average_waiting_time - ppo_snap.average_waiting_time) / (base_snap.average_waiting_time or 1.0)) * 100.0
            speed_imp = ((ppo_snap.average_speed - base_snap.average_speed) / (base_snap.average_speed or 1.0)) * 100.0
            fuel_imp = ((base_snap.total_fuel - ppo_snap.total_fuel) / (base_snap.total_fuel or 1.0)) * 100.0
            
            return {
                "session_ppo": ppo_session_id,
                "session_baseline": baseline_session_id,
                "duration_steps": int(ppo_snap.step) if ppo_snap else 0,
                "metrics": [
                    {
                        "metric": "CO2 Emissions",
                        "baseline": float(base_snap.total_co2),
                        "ppo": float(ppo_snap.total_co2),
                        "diff_absolute": float(ppo_snap.total_co2 - base_snap.total_co2),
                        "improvement_pct": float(co2_imp)
                    },
                    {
                        "metric": "Average Waiting Time",
                        "baseline": float(base_snap.average_waiting_time),
                        "ppo": float(ppo_snap.average_waiting_time),
                        "diff_absolute": float(ppo_snap.average_waiting_time - base_snap.average_waiting_time),
                        "improvement_pct": float(wait_imp)
                    },
                    {
                        "metric": "Average Speed",
                        "baseline": float(base_snap.average_speed),
                        "ppo": float(ppo_snap.average_speed),
                        "diff_absolute": float(ppo_snap.average_speed - base_snap.average_speed),
                        "improvement_pct": float(speed_imp)
                    },
                    {
                        "metric": "Fuel Consumption",
                        "baseline": float(base_snap.total_fuel),
                        "ppo": float(ppo_snap.total_fuel),
                        "diff_absolute": float(ppo_snap.total_fuel - base_snap.total_fuel),
                        "improvement_pct": float(fuel_imp)
                    }
                ]
            }
        finally:
            db.close()

# Singleton Analytics Service
analytics_service = AnalyticsService()
