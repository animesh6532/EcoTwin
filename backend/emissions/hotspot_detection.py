from typing import List, Dict
from backend.core.constants import (
    CO2_HOTSPOT_THRESHOLD,
    NOX_HOTSPOT_THRESHOLD,
    PM25_HOTSPOT_THRESHOLD
)

def identify_hotspot_lanes(lane_emissions: Dict[str, Dict[str, float]]) -> List[str]:
    hotspots = []
    for lane_id, data in lane_emissions.items():
        if (data.get("co2", 0.0) > CO2_HOTSPOT_THRESHOLD or
            data.get("nox", 0.0) > NOX_HOTSPOT_THRESHOLD or
            data.get("pm25", 0.0) > PM25_HOTSPOT_THRESHOLD):
            hotspots.append(lane_id)
    return hotspots
