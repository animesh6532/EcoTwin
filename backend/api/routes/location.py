from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class NetworkJunctionLocation(BaseModel):
    id: str
    x: float
    y: float

class NetworkLocationResponse(BaseModel):
    network_id: str
    projection: str
    boundaries: Dict[str, float]
    center_lat: float
    center_lng: float
    junctions: List[NetworkJunctionLocation]

@router.get("/network", response_model=NetworkLocationResponse)
def get_network_location():
    """
    Returns SUMO network location boundaries, projection, center lat/lng, and junction coordinates.
    """
    return NetworkLocationResponse(
        network_id="SUMO City Network",
        projection="cartesian",
        boundaries={
            "min_x": 0.0,
            "max_x": 1000.0,
            "min_y": 0.0,
            "max_y": 1000.0
        },
        center_lat=52.5200,
        center_lng=13.4050,
        junctions=[
            NetworkJunctionLocation(id="center", x=500.0, y=500.0)
        ]
    )
