from datetime import datetime
import math
from backend.core.logging import logger
from backend.core.database import SessionLocal
from backend.models.orm import SimulationSession, MetricSnapshot

def seed_demo_runs():
    db = SessionLocal()
    try:
        # Check if demo runs already exist
        ppo_id = "dbd76ae5-cf2d-411a-bf2a-60db028b1859"
        base_id = "ca751717-38ee-4b92-a1f7-e4359cd4852c"
        
        ppo_exists = db.query(SimulationSession).filter(SimulationSession.session_id == ppo_id).first()
        base_exists = db.query(SimulationSession).filter(SimulationSession.session_id == base_id).first()
        
        if ppo_exists and base_exists:
            logger.info("Demo comparison runs already exist in database.")
            return
            
        logger.info("Seeding deterministic completed demo comparison runs...")
        
        # Seed sessions
        if not ppo_exists:
            ppo_session = SimulationSession(
                session_id=ppo_id,
                started_at=datetime.utcnow(),
                scenario="normal",
                controller="ppo",
                status="completed"
            )
            db.add(ppo_session)
            
        if not base_exists:
            base_session = SimulationSession(
                session_id=base_id,
                started_at=datetime.utcnow(),
                scenario="normal",
                controller="fixed_time",
                status="completed"
            )
            db.add(base_session)
            
        db.commit()
        
        # Seed metric snapshots: step 0 to 3600 with step interval 100
        # Seed Fixed-Time Baseline Snapshots
        if not base_exists:
            for step in range(0, 3601, 100):
                sim_time = step * 0.1
                
                # Base trends (higher waiting times, higher CO2/NOx, lower speed)
                co2 = step * 340.0 + (step ** 1.05) * 2.0
                nox = step * 0.65 + (step ** 1.02) * 0.05
                fuel = step * 135.0 + (step ** 1.05) * 0.8
                
                speed = 22.0 + 3.0 * math.sin(step / 500.0)
                waiting = 15.0 + 5.0 * math.cos(step / 600.0) + (step / 3600.0) * 8.0
                v_count = int(20 + 8 * math.sin(step / 400.0))
                
                snap = MetricSnapshot(
                    session_id=base_id,
                    step=step,
                    simulation_time=sim_time,
                    vehicle_count=v_count,
                    average_speed=speed,
                    average_waiting_time=waiting,
                    total_co2=co2,
                    total_nox=nox,
                    total_fuel=fuel,
                    reward=None,
                    latency=None
                )
                db.add(snap)
                
        # Seed PPO Snapshots
        if not ppo_exists:
            for step in range(0, 3601, 100):
                sim_time = step * 0.1
                
                # PPO performs better: lower CO2/NOx/fuel, lower waiting time, higher speed
                co2 = (step * 340.0 + (step ** 1.05) * 2.0) * 0.83  # 17% reduction
                nox = (step * 0.65 + (step ** 1.02) * 0.05) * 0.80  # 20% reduction
                fuel = (step * 135.0 + (step ** 1.05) * 0.8) * 0.84  # 16% reduction
                
                speed = 26.5 + 2.5 * math.sin(step / 500.0)
                waiting = 9.5 + 3.0 * math.cos(step / 600.0) + (step / 3600.0) * 2.5
                v_count = int(20 + 8 * math.sin(step / 400.0))
                
                reward = - (waiting * 0.5) + (speed * 0.2)
                latency = 12.0 + 2.0 * math.sin(step / 200.0)
                
                snap = MetricSnapshot(
                    session_id=ppo_id,
                    step=step,
                    simulation_time=sim_time,
                    vehicle_count=v_count,
                    average_speed=speed,
                    average_waiting_time=waiting,
                    total_co2=co2,
                    total_nox=nox,
                    total_fuel=fuel,
                    reward=reward,
                    latency=latency
                )
                db.add(snap)
                
        db.commit()
        logger.info("Demo runs seeded successfully in SQLite database.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding demo runs: {e}")
    finally:
        db.close()
