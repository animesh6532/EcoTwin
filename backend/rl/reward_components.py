import traci
from typing import List

def calculate_delay_penalty(lanes: List[str]) -> float:
    total_waiting_time = 0.0
    for lane_id in lanes:
        try:
            total_waiting_time += traci.lane.getWaitingTime(lane_id)
        except Exception:
            pass
    # Scale wait time to avoid excessively large negative values
    return total_waiting_time / 100.0

def calculate_emission_penalty(lanes: List[str]) -> float:
    total_co2 = 0.0
    total_nox = 0.0
    total_pm25 = 0.0
    
    for lane_id in lanes:
        try:
            total_co2 += traci.lane.getCO2Emission(lane_id)    # mg/s
            total_nox += traci.lane.getNOxEmission(lane_id)    # mg/s
            total_pm25 += traci.lane.getPMxEmission(lane_id)   # mg/s
        except Exception:
            pass
            
    # Normalize emission metrics:
    # CO2 values are typically very large (~10,000 mg/s per idling vehicle)
    # NOx and PM2.5 are small (~10-100 mg/s)
    co2_scaled = total_co2 / 10000.0
    nox_scaled = total_nox / 1000.0
    pm25_scaled = total_pm25 / 100.0
    
    return co2_scaled + nox_scaled + pm25_scaled
