import traci
from typing import List, Dict, Any, Optional
from backend.core.logging import logger

class VehicleService:
    def __init__(self):
        self.cached_vehicles: List[Dict[str, Any]] = []

    def reset(self):
        self.cached_vehicles = []

    def update(self):
        """
        Updates cache with vehicle states for current step.
        """
        self.cached_vehicles = []
        if not traci.isLoaded():
            return
            
        try:
            vehicle_ids = traci.vehicle.getIDList()
            for veh_id in vehicle_ids:
                speed_mps = traci.vehicle.getSpeed(veh_id)
                x, y = traci.vehicle.getPosition(veh_id)
                lane = traci.vehicle.getLaneID(veh_id)
                road = traci.vehicle.getRoadID(veh_id)
                waiting_time = traci.vehicle.getWaitingTime(veh_id)
                
                # Fetch step emissions
                co2 = traci.vehicle.getCO2Emission(veh_id) # mg/s
                nox = traci.vehicle.getNOxEmission(veh_id) # mg/s
                fuel = traci.vehicle.getFuelConsumption(veh_id) # ml/s (approx from SUMO mg/s / 740)
                
                self.cached_vehicles.append({
                    "id": veh_id,
                    "x": float(x),
                    "y": float(y),
                    "speed": float(speed_mps * 3.6), # km/h
                    "waiting_time": float(waiting_time), # seconds
                    "co2": float(co2),
                    "nox": float(nox),
                    "fuel_consumption": float(fuel),
                    "lane_id": lane,
                    "road_id": road
                })
        except Exception as e:
            logger.warning(f"Error querying vehicle states: {e}")

    def get_all_vehicles(self) -> List[Dict[str, Any]]:
        return self.cached_vehicles

    def get_vehicle(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        for v in self.cached_vehicles:
            if v["id"] == vehicle_id:
                return v
        return None

    def get_summary(self) -> Dict[str, Any]:
        """
        Return totals and averages for active vehicles.
        """
        total = len(self.cached_vehicles)
        if total == 0:
            return {
                "total_vehicles": 0,
                "average_speed": 0.0,
                "average_waiting_time": 0.0,
                "total_co2": 0.0,
                "average_co2": 0.0,
                "total_nox": 0.0,
                "total_fuel": 0.0
            }
            
        sum_speed = sum(v["speed"] for v in self.cached_vehicles)
        sum_waiting = sum(v["waiting_time"] for v in self.cached_vehicles)
        sum_co2 = sum(v["co2"] for v in self.cached_vehicles)
        sum_nox = sum(v["nox"] for v in self.cached_vehicles)
        sum_fuel = sum(v["fuel_consumption"] for v in self.cached_vehicles)
        
        return {
            "total_vehicles": total,
            "average_speed": float(sum_speed / total),
            "average_waiting_time": float(sum_waiting / total),
            "total_co2": float(sum_co2),
            "average_co2": float(sum_co2 / total),
            "total_nox": float(sum_nox),
            "total_fuel": float(sum_fuel)
        }

# Singleton Vehicle Service
vehicle_service = VehicleService()
