from fastapi import APIRouter
from typing import List
from backend.models.schemas import EmissionMetrics, PollutionCell, EmissionsResponse
from backend.simulation.emission_service import emission_service

router = APIRouter()

@router.get("/current", response_model=EmissionMetrics)
def get_current_emissions():
    """
    Returns instantaneous emissions in mg/s or ml/s for active step.
    """
    return emission_service.get_current_metrics()

@router.get("/history", response_model=EmissionMetrics)
def get_accumulated_emissions():
    """
    Returns total accumulated emissions over the active simulation session.
    """
    return emission_service.get_accumulated_metrics()

@router.get("/hotspots", response_model=List[str])
def get_emission_hotspots():
    """
    List of lane IDs exceeding safe emission thresholds.
    """
    return emission_service.get_hotspots()

@router.get("/summary", response_model=List[PollutionCell])
def get_emissions_summary():
    """
    Returns spatial pollution grid cells for rendering hotspots in Deck.gl/Leaflet.
    """
    return emission_service.get_pollution_grid()
