from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from backend.services.metrics_service import metrics_service
from backend.simulation.manager import simulation_manager

router = APIRouter()

@router.get("/current")
def get_current_metrics():
    """
    Returns aggregated metrics for the current step.
    """
    if not simulation_manager.running:
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    return metrics_service.get_current_snapshot()

@router.get("/history")
def get_historical_metrics(session_id: str = Query(..., description="Target session UUID")):
    """
    Returns time-series metrics history from database for the specified session ID.
    """
    history = metrics_service.get_session_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail=f"No metrics history found for session '{session_id}'.")
    return history
