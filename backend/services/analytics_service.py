from typing import Dict, Any
import uuid
from backend.core.database import SessionLocal
from backend.models.orm import MetricSnapshot, SimulationSession

def calculate_improvement(baseline: float, ppo: float, lower_is_better: bool = True) -> float:
    if baseline == 0.0:
        if ppo == 0.0:
            return 0.0
        return -100.0 if lower_is_better else 100.0
    if lower_is_better:
        return ((baseline - ppo) / baseline) * 100.0
    else:
        return ((ppo - baseline) / baseline) * 100.0

class AnalyticsService:
    @staticmethod
    def compare_runs(ppo_session_id: str, baseline_session_id: str) -> Dict[str, Any]:
        """
        Compare PPO optimization run vs Fixed-time baseline run.
        """
        # 1. Validate UUID format
        try:
            uuid.UUID(ppo_session_id)
        except ValueError:
            raise ValueError("Invalid PPO session UUID format.")
            
        try:
            uuid.UUID(baseline_session_id)
        except ValueError:
            raise ValueError("Invalid Baseline session UUID format.")
            
        db = SessionLocal()
        try:
            # 2. Check if both sessions exist
            ppo_session = db.query(SimulationSession).filter(SimulationSession.session_id == ppo_session_id).first()
            base_session = db.query(SimulationSession).filter(SimulationSession.session_id == baseline_session_id).first()
            
            missing = []
            if not ppo_session:
                missing.append("PPO")
            if not base_session:
                missing.append("Baseline")
                
            if missing:
                raise ValueError(f"Run session not found for: {', '.join(missing)}")
                
            # 3. Check if both sessions are completed
            incomplete = []
            if ppo_session.status != "completed":
                incomplete.append("PPO")
            if base_session.status != "completed":
                incomplete.append("Baseline")
                
            if incomplete:
                raise ValueError(f"Simulation is not completed for: {', '.join(incomplete)}")
                
            # 4. Check compatibility (same scenario)
            if ppo_session.scenario != base_session.scenario:
                raise ValueError("Runs cannot be compared because they use different simulation scenarios.")

            # 5. Query last snapshots for both sessions
            ppo_snap = db.query(MetricSnapshot).filter(MetricSnapshot.session_id == ppo_session_id).order_by(MetricSnapshot.step.desc()).first()
            base_snap = db.query(MetricSnapshot).filter(MetricSnapshot.session_id == baseline_session_id).order_by(MetricSnapshot.step.desc()).first()
            
            if not ppo_snap or not base_snap:
                raise ValueError("Required metrics are unavailable. One or both simulation sessions do not contain metric snapshots in database.")
                
            co2_imp = calculate_improvement(base_snap.total_co2, ppo_snap.total_co2, lower_is_better=True)
            nox_imp = calculate_improvement(base_snap.total_nox, ppo_snap.total_nox, lower_is_better=True)
            wait_imp = calculate_improvement(base_snap.average_waiting_time, ppo_snap.average_waiting_time, lower_is_better=True)
            speed_imp = calculate_improvement(base_snap.average_speed, ppo_snap.average_speed, lower_is_better=False)
            fuel_imp = calculate_improvement(base_snap.total_fuel, ppo_snap.total_fuel, lower_is_better=True)
            
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
                        "metric": "NOx Emissions",
                        "baseline": float(base_snap.total_nox),
                        "ppo": float(ppo_snap.total_nox),
                        "diff_absolute": float(ppo_snap.total_nox - base_snap.total_nox),
                        "improvement_pct": float(nox_imp)
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
