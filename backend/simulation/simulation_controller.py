import threading
import time
from typing import Dict, Any, Optional
from backend.core.logging import logger
from backend.simulation.sumo_manager import sumo_manager
from backend.simulation.traci_client import traci_client

class SimulationController:
    def __init__(self):
        self.running = False
        self.paused = False
        self.step_count = 0
        self.config: Optional[Any] = None
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()
        self.on_step_callbacks = []

    def start(self, config: Any) -> bool:
        with self._lock:
            if self.running:
                return False
            
            self.config = config
            self.running = True
            self.paused = True  # Start in paused state, wait for resume or step
            self.step_count = 0
            
            # Start connection in main or side thread? We connect and then start a worker loop thread.
            binary = sumo_manager.get_binary_path(config.gui)
            sumocfg = sumo_manager.get_default_config_path(config.scenario)
            
            traci_client.connect(binary, sumocfg, config.step_length)
            
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()
            logger.info("Simulation loop worker thread started.")
            return True

    def _run_loop(self):
        while self.running:
            if not self.paused:
                self.step()
                time.sleep(0.01)  # Throttle simulation speed slightly
            else:
                time.sleep(0.1)

    def step(self):
        with self._lock:
            if not self.running:
                return
            
            try:
                traci_client.step()
                self.step_count += 1
                
                # Fire callbacks
                for cb in self.on_step_callbacks:
                    cb(self.step_count)
            except Exception as e:
                logger.error(f"Error during simulation step execution: {e}")
                self.running = False

    def pause(self):
        with self._lock:
            self.paused = True
            logger.info("Simulation paused.")

    def resume(self):
        with self._lock:
            self.paused = False
            logger.info("Simulation resumed.")

    def stop(self):
        with self._lock:
            if not self.running:
                return
            self.running = False
            
        if self._thread:
            self._thread.join(timeout=2.0)
            
        traci_client.close()
        logger.info("Simulation stopped and closed.")

    def register_step_callback(self, cb):
        self.on_step_callbacks.append(cb)

simulation_controller = SimulationController()
