import traci

def get_co2_emission_for_lane(lane_id: str) -> float:
    """
    Get CO2 emission for a specific lane in mg/s.
    """
    if not traci.isLoaded():
        return 0.0
    try:
        return float(traci.lane.getCO2Emission(lane_id))
    except Exception:
        return 0.0

def get_co2_emission_for_vehicle(veh_id: str) -> float:
    """
    Get CO2 emission for a specific vehicle in mg/s.
    """
    if not traci.isLoaded():
        return 0.0
    try:
        return float(traci.vehicle.getCO2Emission(veh_id))
    except Exception:
        return 0.0
