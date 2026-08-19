import traci

def get_pm25_emission_for_lane(lane_id: str) -> float:
    """
    Get PM2.5 (PMx) emission for a specific lane in mg/s.
    """
    if not traci.isLoaded():
        return 0.0
    try:
        return float(traci.lane.getPMxEmission(lane_id))
    except Exception:
        return 0.0

def get_pm25_emission_for_vehicle(veh_id: str) -> float:
    """
    Get PM2.5 (PMx) emission for a specific vehicle in mg/s.
    """
    if not traci.isLoaded():
        return 0.0
    try:
        return float(traci.vehicle.getPMxEmission(veh_id))
    except Exception:
        return 0.0
