import asyncio
from datetime import datetime
from typing import Dict, Any
from backend.core.logging import logger
from backend.simulation.manager import simulation_manager
from backend.simulation.vehicle_service import vehicle_service
from backend.simulation.emission_service import emission_service
from backend.simulation.traffic_light_controller import TrafficLightController
from backend.models.schemas import SimulationConfig
from backend.websocket.manager import manager

class SimulationService:
    def __init__(self):
        self.config = None
        self.loop = None
        simulation_manager.register_step_callback(self._on_step_callback)

    def start(self, config: SimulationConfig) -> bool:
        self.config = config
        return simulation_manager.start(config)

    def pause(self):
        simulation_manager.pause()

    def resume(self):
        simulation_manager.resume()

    def step(self):
        simulation_manager.step()

    def stop(self):
        simulation_manager.stop()

    def is_running(self) -> bool:
        return simulation_manager.running

    def get_state(self) -> Dict[str, Any]:
        status_info = simulation_manager.get_status()
        return {
            "status": "running" if status_info["running"] else "stopped",
            "step": simulation_manager.step_count,
            "active_vehicles": status_info["vehicle_count"],
            "completed_vehicles": 0,
            "running": status_info["running"],
            "paused": status_info["paused"],
            "controller": status_info["controller"],
            "session_id": status_info["session_id"]
        }

    def _on_step_callback(self, step_number: int):
        # Gather live states from services
        vehicles = vehicle_service.get_all_vehicles()
        v_summary = vehicle_service.get_summary()
        
        # Query traffic lights
        tls_ids = TrafficLightController.discover_tls_ids()
        traffic_lights = []
        for t_id in tls_ids:
            phase = TrafficLightController.get_current_phase(t_id)
            # Default phases defined by SUMO logic
            traffic_lights.append({
                "id": t_id,
                "active_phase": phase,
                "phases": ["GGGggrrrrrGGGggrrrrr", "yyyyyrrrrryyyyyrrrrr", "rrrrrGGGggrrrrrGGGgg", "rrrrryyyyyrrrrryyyyy"]
            })
            
        e_current = emission_service.get_current_metrics()
        
        # Compile pollution grid aggregation hotspots
        pollution_grid = emission_service.get_pollution_grid()
        pollution_payload = [
            {"x": cell.x, "y": cell.y, "intensity": cell.intensity, "co2": cell.co2, "vehicles": cell.vehicles}
            for cell in pollution_grid
        ]
        
        # Structure payload frame
        payload = {
            "type": "simulation_state",
            "timestamp": datetime.utcnow().isoformat(),
            "simulation_time": step_number * simulation_manager.step_length,
            "vehicles": vehicles,
            "traffic_lights": traffic_lights,
            "metrics": {
                "vehicle_count": v_summary["total_vehicles"],
                "average_speed": v_summary["average_speed"],
                "average_waiting_time": v_summary["average_waiting_time"],
                "total_co2": e_current.co2
            },
            "pollution": pollution_payload
        }
        
        # Dispatch to all WebSocket listeners safely on active loop
        if self.loop and self.loop.is_running():
            try:
                asyncio.run_coroutine_threadsafe(manager.broadcast(payload), self.loop)
            except Exception as e:
                logger.error(f"Error dispatching websocket broadcast: {e}")
        else:
            logger.warning("ASGI event loop is not captured or not running, skipping websocket broadcast.")

simulation_service = SimulationService()
