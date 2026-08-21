from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.models.schemas import Vehicle, VehicleSummary
from backend.simulation.vehicle_service import vehicle_service

router = APIRouter()

@router.get("", response_model=List[Vehicle])
def get_vehicles(
    limit: int = Query(default=100, ge=1, le=1000, description="Max vehicles to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination")
):
    """
    Returns active vehicles list in current simulation step.
    """
    vehicles = vehicle_service.get_all_vehicles()
    
    # Map to schema
    pydantic_vehicles = []
    for v in vehicles:
        pydantic_vehicles.append(Vehicle(
            id=v["id"],
            x=v["x"],
            y=v["y"],
            speed=v["speed"],
            waiting_time=v["waiting_time"],
            co2=v["co2"],
            nox=v["nox"],
            fuel_consumption=v["fuel_consumption"],
            lane_id=v["lane_id"],
            road_id=v["road_id"]
        ))
        
    return pydantic_vehicles[offset : offset + limit]

@router.get("/summary", response_model=VehicleSummary)
def get_vehicles_summary():
    """
    Returns aggregated metrics for active vehicles.
    """
    summary = vehicle_service.get_summary()
    return VehicleSummary(
        total_vehicles=summary["total_vehicles"],
        average_speed=summary["average_speed"],
        average_waiting_time=summary["average_waiting_time"],
        total_co2=summary["total_co2"],
        average_co2=summary["average_co2"],
        total_nox=summary["total_nox"],
        total_fuel=summary["total_fuel"]
    )

@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle_by_id(vehicle_id: str):
    """
    Retrieve state for a specific vehicle by its ID.
    """
    v = vehicle_service.get_vehicle(vehicle_id)
    if not v:
        raise HTTPException(status_code=404, detail=f"Vehicle '{vehicle_id}' not found.")
        
    return Vehicle(
        id=v["id"],
        x=v["x"],
        y=v["y"],
        speed=v["speed"],
        waiting_time=v["waiting_time"],
        co2=v["co2"],
        nox=v["nox"],
        fuel_consumption=v["fuel_consumption"],
        lane_id=v["lane_id"],
        road_id=v["road_id"]
    )
