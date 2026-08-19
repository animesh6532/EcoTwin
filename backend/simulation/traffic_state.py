import traci
from typing import List, Dict, Any
from backend.core.logging import logger

class TrafficState:
    @staticmethod
    def get_active_vehicles() -> List[Dict[str, Any]]:
        vehicles = []
        if not traci.isLoaded():
            return vehicles
            
        try:
            vehicle_ids = traci.vehicle.getIDList()
            for veh_id in vehicle_ids:
                # Get vehicle features
                speed = traci.vehicle.getSpeed(veh_id)
                x, y = traci.vehicle.getPosition(veh_id)
                lane = traci.vehicle.getLaneID(veh_id)
                type_id = traci.vehicle.getTypeID(veh_id)
                waiting_time = traci.vehicle.getWaitingTime(veh_id)
                
                vehicles.append({
                    "id": veh_id,
                    "x": x,
                    "y": y,
                    "speed": speed * 3.6,  # Convert m/s to km/h
                    "lane": lane,
                    "type": type_id,
                    "waiting_time": waiting_time
                })
        except Exception as e:
            logger.warning(f"Error fetching vehicle traffic states: {e}")
            
        return vehicles

    @staticmethod
    def get_average_speed() -> float:
        if not traci.isLoaded():
            return 0.0
        try:
            vehicle_ids = traci.vehicle.getIDList()
            if not vehicle_ids:
                return 0.0
            speeds = [traci.vehicle.getSpeed(v) for v in vehicle_ids]
            return (sum(speeds) / len(speeds)) * 3.6  # km/h
        except Exception:
            return 0.0

    @staticmethod
    def get_queue_lengths() -> Dict[str, float]:
        queues = {}
        if not traci.isLoaded():
            return queues
        try:
            lanes = traci.lane.getIDList()
            for lane_id in lanes:
                # standard SUMO definition of a halting vehicle is speed < 0.1 m/s
                queues[lane_id] = float(traci.lane.getLastStepHaltingNumber(lane_id))
        except Exception:
            pass
        return queues
