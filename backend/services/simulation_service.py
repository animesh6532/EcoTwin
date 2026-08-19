import asyncio
from typing import Dict, Any
from backend.core.logging import logger
from backend.simulation.simulation_controller import simulation_controller
from backend.simulation.traffic_state import TrafficState
from backend.simulation.traffic_lights import TrafficLightsManager
from backend.simulation.emission_collector import EmissionCollector
from backend.api.schemas import SimulationConfig
from backend.api.websocket import manager

class SimulationService:
    def __init__(self):
        self.config = None
        simulation_controller.register_step_callback(self._on_step_callback)

    def start(self, config: SimulationConfig) -> bool:
        self.config = config
        return simulation_controller.start(config)

    def pause(self):
        simulation_controller.pause()

    def resume(self):
        simulation_controller.resume()

    def step(self):
        simulation_controller.step()

    def stop(self):
        simulation_controller.stop()

    def is_running(self) -> bool:
        return simulation_controller.running

    def get_state(self) -> Dict[str, Any]:
        vehicles = TrafficState.get_active_vehicles() if self.is_running() else []
        return {
            "status": "running" if self.is_running() else "stopped",
            "step": simulation_controller.step_count,
            "active_vehicles": len(vehicles),
            "completed_vehicles": 0,  # SUMO tracks departed/arrived
            "running": self.is_running()
        }

    def _on_step_callback(self, step_number: int):
        # Gather live features
        vehicles = TrafficState.get_active_vehicles()
        tls_ids = TrafficLightsManager.get_tls_ids()
        signals = {tls_id: TrafficLightsManager.get_state(tls_id) for tls_id in tls_ids}
        emissions = EmissionCollector.get_system_emissions()
        
        # Structure broadcast frame
        payload = {
            "type": "state_update",
            "step": step_number,
            "vehicles": vehicles,
            "signals": signals,
            "emissions": emissions
        }
        
        # Schedule websocket broadcast on the event loop safely
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(manager.broadcast(payload))
        except RuntimeError:
            # Occurs if we're not inside an active event loop
            pass

simulation_service = SimulationService()
