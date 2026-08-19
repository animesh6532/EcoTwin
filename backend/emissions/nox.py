import traci

def get_nox_emission_for_lane(lane_id: str) -> float:
    """
    Get NOx emission for a specific lane in mg/s.
    """
    if not traci.isLoaded():
        return 0.0
    try:
        return float(traci.lane.getNOxEmission(lane_id))
    except Exception:
        return 0.0

def get_nox_emission_for_vehicle(veh_id: str) -> float:
    """
    Get NOx emission for a specific vehicle in mg/s.
    """
    if not traci.isLoaded():
        return 0.0
    try:
        return float(traci.vehicle.getNOxEmission(veh_id))
    except Exception:
        return 0.0
