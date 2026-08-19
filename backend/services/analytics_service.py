import time
from typing import Dict, Any, List
from backend.simulation.simulation_controller import simulation_controller
from backend.simulation.traffic_state import TrafficState
from backend.simulation.traffic_lights import TrafficLightsManager
from backend.simulation.emission_collector import EmissionCollector

class AnalyticsService:
    def __init__(self):
        # Cache of current performance to serve standard API requests
        pass

    def get_current_traffic_metrics(self) -> Dict[str, Any]:
        tls_ids = TrafficLightsManager.get_tls_ids()
        
        intersections = []
        for tls_id in tls_ids:
            # Query active TLS features
            state = TrafficLightsManager.get_state(tls_id)
            # Fetch halting counts for controlled lanes
            try:
                import traci
                controlled_lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(tls_id)))
                queue = sum([traci.lane.getLastStepHaltingNumber(l) for l in controlled_lanes])
                delay = sum([traci.lane.getWaitingTime(l) for l in controlled_lanes]) / max(len(controlled_lanes), 1)
                wait = sum([traci.lane.getWaitingTime(l) for l in controlled_lanes])
            except Exception:
                queue = 0.0
                delay = 0.0
                wait = 0.0
                
            intersections.append({
                "intersection_id": tls_id,
                "phase": state["phase"],
                "phase_name": state["ryg_state"],
                "queue_length": float(queue),
                "average_delay": float(delay),
                "total_waiting_time": float(wait)
            })

        return {
            "timestamp": time.time(),
            "step": simulation_controller.step_count,
            "average_speed": TrafficState.get_average_speed(),
            "active_vehicles": len(TrafficState.get_active_vehicles()),
            "intersections": intersections
        }

    def get_current_emissions_metrics(self) -> Dict[str, Any]:
        sys_emissions = EmissionCollector.get_system_emissions()
        lane_emissions = EmissionCollector.get_lane_emissions()
        hotspots = EmissionCollector.detect_hotspots(lane_emissions)
        
        # Format dictionary
        formatted_lanes = {}
        for lane_id, data in lane_emissions.items():
            formatted_lanes[lane_id] = {
                "co2": float(data["co2"]),
                "nox": float(data["nox"]),
                "pm25": float(data["pm25"]),
                "fuel": float(data["fuel"])
            }

        return {
            "timestamp": time.time(),
            "step": simulation_controller.step_count,
            "total_emissions": {
                "co2": float(sys_emissions["co2"]),
                "nox": float(sys_emissions["nox"]),
                "pm25": float(sys_emissions["pm25"]),
                "fuel": float(sys_emissions["fuel"])
            },
            "lane_emissions": formatted_lanes,
            "hotspots": hotspots
        }

analytics_service = AnalyticsService()
