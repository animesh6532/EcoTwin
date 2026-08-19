from backend.emissions.co2 import get_co2_emission_for_lane
from backend.emissions.nox import get_nox_emission_for_lane
from backend.emissions.pm25 import get_pm25_emission_for_lane

def calculate_pollution_index_for_lane(lane_id: str) -> float:
    co2 = get_co2_emission_for_lane(lane_id)
    nox = get_nox_emission_for_lane(lane_id)
    pm25 = get_pm25_emission_for_lane(lane_id)
    
    # Simple weighted formula to produce an AQI equivalent (0-100 score)
    # CO2 scales up to 100,000 mg/s; NOx to 1,000 mg/s; PM2.5 to 100 mg/s
    co2_score = min(co2 / 50000.0, 1.0) * 40.0
    nox_score = min(nox / 500.0, 1.0) * 30.0
    pm25_score = min(pm25 / 50.0, 1.0) * 30.0
    
    return float(co2_score + nox_score + pm25_score)
