import traci
from typing import Dict, Any, List
from backend.core.constants import (
    CO2_HOTSPOT_THRESHOLD, 
    NOX_HOTSPOT_THRESHOLD, 
    PM25_HOTSPOT_THRESHOLD
)

class EmissionCollector:
    @staticmethod
    def get_system_emissions() -> Dict[str, float]:
        emissions = {"co2": 0.0, "nox": 0.0, "pm25": 0.0, "fuel": 0.0}
        if not traci.isLoaded():
            return emissions
        
        try:
            vehicle_ids = traci.vehicle.getIDList()
            for v_id in vehicle_ids:
                emissions["co2"] += traci.vehicle.getCO2Emission(v_id)    # mg/s
                emissions["nox"] += traci.vehicle.getNOxEmission(v_id)    # mg/s
                emissions["pm25"] += traci.vehicle.getPMxEmission(v_id)   # mg/s (approximated from PMx)
                emissions["fuel"] += traci.vehicle.getFuelConsumption(v_id) # ml/s
        except Exception:
            pass
            
        return emissions

    @staticmethod
    def get_lane_emissions() -> Dict[str, Dict[str, float]]:
        lane_data = {}
        if not traci.isLoaded():
            return lane_data
            
        try:
            lanes = traci.lane.getIDList()
            for lane_id in lanes:
                co2 = traci.lane.getCO2Emission(lane_id)
                nox = traci.lane.getNOxEmission(lane_id)
                pm25 = traci.lane.getPMxEmission(lane_id)
                fuel = traci.lane.getFuelConsumption(lane_id)
                
                lane_data[lane_id] = {
                    "co2": co2,
                    "nox": nox,
                    "pm25": pm25,
                    "fuel": fuel
                }
        except Exception:
            pass
            
        return lane_data

    @staticmethod
    def detect_hotspots(lane_emissions: Dict[str, Dict[str, float]]) -> List[str]:
        hotspots = []
        for lane_id, data in lane_emissions.items():
            # Check thresholds
            if (data["co2"] > CO2_HOTSPOT_THRESHOLD or 
                data["nox"] > NOX_HOTSPOT_THRESHOLD or 
                data["pm25"] > PM25_HOTSPOT_THRESHOLD):
                hotspots.append(lane_id)
        return hotspots
