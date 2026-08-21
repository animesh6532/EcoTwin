import threading
import time
import uuid
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
from backend.core.logging import logger
from backend.core.config import settings
from backend.simulation.sumo_manager import sumo_manager
from backend.simulation.traci_client import traci_client
from backend.simulation.vehicle_service import vehicle_service
from backend.simulation.emission_service import emission_service
from backend.simulation.traffic_light_controller import TrafficLightController
from backend.rl.observation_builder import ObservationBuilder
from backend.rl.ppo_service import PPOService
from backend.rl.action_mapper import ActionMapper
from backend.rl.reward_service import reward_service
from backend.core.database import SessionLocal
from backend.models.orm import SimulationSession, MetricSnapshot

class SimulationManager:
    def __init__(self):
        self.running = False
        self.paused = False
        self.step_count = 0
        self.max_steps = 3600
        self.step_length = 0.1
        self.session_id: Optional[str] = None
        self.controller_type = "fixed_time" # "fixed_time" or "ppo"
        self.scenario = "normal"
        
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()
        
        # Observers
        self.on_step_callbacks = []
        
        # RL inference tracking
        self.obs_builder = ObservationBuilder()
        self.ppo_service = PPOService()
        self.action_mapper = ActionMapper()
        self.last_reward = 0.0
        self.last_latency_ms = 0.0
        self.tls_id = "center"

    def start(self, config) -> bool:
        """
        Starts the simulation under a unique session ID.
        """
        with self._lock:
            if self.running:
                return False
                
            self.session_id = str(uuid.uuid4())
            self.controller_type = config.controller
            self.scenario = config.scenario
            self.step_length = config.step_length
            self.max_steps = config.duration
            self.step_count = 0
            self.last_reward = 0.0
            self.last_latency_ms = 0.0
            
            logger.info(f"Initializing simulation session: {self.session_id} using {self.controller_type} controller.")
            
            # Save session to Database
            self._save_session_db("running")
            
            # Start SUMO Subprocess
            binary = sumo_manager.get_binary_path(config.gui)
            sumocfg = sumo_manager.get_default_config_path(config.scenario)
            
            traci_client.connect(binary, sumocfg, config.step_length, label=self.session_id)
            
            # Reset services
            emission_service.reset()
            vehicle_service.reset()
            
            self.running = True
            self.paused = False
            
            # Start loop worker thread
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()
            
            return True

    def _run_loop(self):
        while self.running:
            if not self.paused:
                self.step()
                time.sleep(self.step_length)
            else:
                time.sleep(0.1)

    def step(self):
        with self._lock:
            if not self.running:
                return
                
            try:
                # 1. Closed-loop PPO agent action application (if enabled)
                if self.controller_type == "ppo" and traci_client.connected:
                    self._apply_ppo_step()
                    
                # 2. Advance TraCI step
                traci_client.step()
                self.step_count += 1
                
                # 3. Process services
                vehicle_service.update()
                emission_service.update()
                
                # 4. Save step aggregate metrics snapshot to Database
                self._save_metric_snapshot_db()
                
                # 5. Fire callbacks (for websocket broadcasts)
                for cb in self.on_step_callbacks:
                    cb(self.step_count)
                    
                # End check
                if self.step_count >= self.max_steps:
                    self.stop()
                    
            except Exception as e:
                logger.error(f"Error stepping simulation loop: {e}")
                self.stop()

    def _apply_ppo_step(self):
        start_time = time.perf_counter()
        try:
            # Check if intersection exists
            tls_ids = TrafficLightController.discover_tls_ids()
            if not tls_ids:
                return
            if self.tls_id not in tls_ids:
                self.tls_id = tls_ids[0]
                
            # Build observation vector (8D)
            obs = self.obs_builder.build_observation(self.tls_id)
            
            # Predict PPO policy action [0, 3]
            action = self.ppo_service.get_action(obs)
            
            # Map PPO action to signal phase index and apply
            phase = self.action_mapper.map_action(action)
            TrafficLightController.apply_action(self.tls_id, phase)
            
            # Record latency and reward
            self.last_latency_ms = (time.perf_counter() - start_time) * 1000.0
            
            controlled_lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(self.tls_id)))
            self.last_reward = reward_service.compute_reward(controlled_lanes)
        except Exception as e:
            logger.warning(f"Failed to execute PPO optimization step: {e}")

    def pause(self):
        with self._lock:
            self.paused = True
            self._save_session_db("paused")
            logger.info("Simulation paused.")

    def resume(self):
        with self._lock:
            self.paused = False
            self._save_session_db("running")
            logger.info("Simulation resumed.")

    def stop(self):
        """
        Safely stops the SUMO subprocess, joins background threads, and commits completed session.
        """
        with self._lock:
            if not self.running:
                return
            self.running = False
            self.paused = False
            
        if self._thread:
            self._thread.join(timeout=2.0)
            
        traci_client.close()
        self._save_session_db("completed" if self.step_count >= self.max_steps else "stopped")
        logger.info("Simulation stopped successfully.")

    def get_status(self) -> Dict[str, Any]:
        """
        Returns active status matching:
        {running: bool, paused: bool, simulation_time: float, vehicle_count: int, controller: str}
        """
        active_count = len(vehicle_service.get_all_vehicles())
        sim_time = self.step_count * self.step_length
        return {
            "running": self.running,
            "paused": self.paused,
            "simulation_time": sim_time,
            "vehicle_count": active_count,
            "controller": self.controller_type,
            "session_id": self.session_id
        }

    def register_step_callback(self, cb):
        self.on_step_callbacks.append(cb)

    def _save_session_db(self, status: str):
        db = SessionLocal()
        try:
            session = db.query(SimulationSession).filter(SimulationSession.session_id == self.session_id).first()
            if not session:
                session = SimulationSession(
                    session_id=self.session_id,
                    started_at=datetime.utcnow(),
                    scenario=self.scenario,
                    controller=self.controller_type,
                    status=status
                )
                db.add(session)
            else:
                session.status = status
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save simulation session state to database: {e}")
        finally:
            db.close()

    def _save_metric_snapshot_db(self):
        db = SessionLocal()
        try:
            # Compile aggregate metrics
            v_metrics = vehicle_service.get_summary()
            e_metrics = emission_service.get_current_metrics()
            
            snapshot = MetricSnapshot(
                session_id=self.session_id,
                step=self.step_count,
                simulation_time=self.step_count * self.step_length,
                vehicle_count=v_metrics["total_vehicles"],
                average_speed=v_metrics["average_speed"],
                average_waiting_time=v_metrics["average_waiting_time"],
                total_co2=e_metrics.co2,
                total_nox=e_metrics.nox,
                total_fuel=e_metrics.fuel,
                reward=self.last_reward if self.controller_type == "ppo" else None,
                latency=self.last_latency_ms if self.controller_type == "ppo" else None
            )
            db.add(snapshot)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to save step metric snapshot to database: {e}")
        finally:
            db.close()

# Singleton Simulation Manager
simulation_manager = SimulationManager()
