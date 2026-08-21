import traci
from typing import Dict, Any, List, Tuple
from backend.core.logging import logger
from backend.core.constants import (
    CO2_HOTSPOT_THRESHOLD,
    NOX_HOTSPOT_THRESHOLD,
    PM25_HOTSPOT_THRESHOLD
)
from backend.models.schemas import EmissionMetrics, PollutionCell
from backend.simulation.vehicle_service import vehicle_service

class EmissionService:
    def __init__(self):
        self.accumulated_co2 = 0.0
        self.accumulated_nox = 0.0
        self.accumulated_fuel = 0.0
        self.grid_size = 50.0 # 50m cells for aggregation

    def reset(self):
        self.accumulated_co2 = 0.0
        self.accumulated_nox = 0.0
        self.accumulated_fuel = 0.0

    def update(self):
        """
        Updates accumulated total emissions of active vehicles in step.
        """
        current = self.get_current_metrics()
        self.accumulated_co2 += current.co2
        self.accumulated_nox += current.nox
        self.accumulated_fuel += current.fuel

    def get_current_metrics(self) -> EmissionMetrics:
        """
        Returns instantaneous sum of emissions across active vehicles in mg/s or ml/s.
        """
        co2_rate = 0.0
        nox_rate = 0.0
        fuel_rate = 0.0
        
        vehicles = vehicle_service.get_all_vehicles()
        for v in vehicles:
            co2_rate += v["co2"]
            nox_rate += v["nox"]
            fuel_rate += v["fuel_consumption"]
            
        return EmissionMetrics(co2=co2_rate, nox=nox_rate, fuel=fuel_rate)

    def get_accumulated_metrics(self) -> EmissionMetrics:
        return EmissionMetrics(
            co2=self.accumulated_co2,
            nox=self.accumulated_nox,
            fuel=self.accumulated_fuel
        )

    def get_hotspots(self) -> List[str]:
        hotspots = []
        if not traci.isLoaded():
            return hotspots
            
        try:
            lanes = traci.lane.getIDList()
            for lane_id in lanes:
                co2 = traci.lane.getCO2Emission(lane_id)
                nox = traci.lane.getNOxEmission(lane_id)
                pm25 = traci.lane.getPMxEmission(lane_id)
                
                if (co2 > CO2_HOTSPOT_THRESHOLD or 
                    nox > NOX_HOTSPOT_THRESHOLD or 
                    pm25 > PM25_HOTSPOT_THRESHOLD):
                    hotspots.append(lane_id)
        except Exception as e:
            logger.warning(f"Error detecting hotspots: {e}")
            
        return hotspots

    def get_pollution_grid(self) -> List[PollutionCell]:
        """
        Aggregates vehicle positions and emissions into spatial grid coordinates.
        """
        cells: Dict[Tuple[int, int], Dict[str, Any]] = {}
        vehicles = vehicle_service.get_all_vehicles()
        
        for v in vehicles:
            # Map coordinates to grid cell center
            cell_x = int(v["x"] // self.grid_size) * int(self.grid_size)
            cell_y = int(v["y"] // self.grid_size) * int(self.grid_size)
            key = (cell_x, cell_y)
            
            if key not in cells:
                cells[key] = {
                    "co2": 0.0,
                    "vehicles": set(),
                    "waiting_time": 0.0
                }
                
            cells[key]["co2"] += v["co2"]
            cells[key]["vehicles"].add(v["id"])
            cells[key]["waiting_time"] += v["waiting_time"]
            
        grid_cells = []
        # Max parameters for simple intensity normalization
        max_co2 = max([c["co2"] for c in cells.values()], default=1.0)
        
        for (cx, cy), data in cells.items():
            # Pollution intensity score (0.0 to 1.0) based on CO2 load
            intensity = min(1.0, data["co2"] / (max_co2 or 1.0))
            
            grid_cells.append(PollutionCell(
                x=float(cx),
                y=float(cy),
                intensity=float(intensity),
                co2=float(data["co2"]),
                vehicles=len(data["vehicles"])
            ))
            
        return grid_cells

# Singleton Emission Service
emission_service = EmissionService()
