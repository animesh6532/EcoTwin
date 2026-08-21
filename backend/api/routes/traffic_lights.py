from fastapi import APIRouter, HTTPException, Query, status
from typing import List
from backend.models.schemas import TrafficLight
from backend.simulation.traffic_light_controller import TrafficLightController

router = APIRouter()

@router.get("", response_model=List[str])
def get_traffic_lights():
    """
    Returns list of discovered traffic light IDs in simulation.
    """
    return TrafficLightController.discover_tls_ids()

@router.get("/{id}", response_model=TrafficLight)
def get_traffic_light(id: str):
    """
    Returns detail for a specific traffic light junction.
    """
    tls_ids = TrafficLightController.discover_tls_ids()
    if id not in tls_ids:
        raise HTTPException(status_code=404, detail=f"Traffic light junction '{id}' not found.")
        
    phase = TrafficLightController.get_current_phase(id)
    return TrafficLight(
        id=id,
        active_phase=phase,
        phases=["GGGggrrrrrGGGggrrrrr", "yyyyyrrrrryyyyyrrrrr", "rrrrrGGGggrrrrrGGGgg", "rrrrryyyyyrrrrryyyyy"]
    )

@router.get("/{id}/state")
def get_traffic_light_state(id: str):
    tls_ids = TrafficLightController.discover_tls_ids()
    if id not in tls_ids:
        raise HTTPException(status_code=404, detail=f"Traffic light junction '{id}' not found.")
        
    phase = TrafficLightController.get_current_phase(id)
    return {"id": id, "phase": phase}

@router.post("/{id}/action", status_code=status.HTTP_200_OK)
def set_traffic_light_action(id: str, action: int = Query(..., description="Phase index [0-3] to set")):
    """
    Send manual action phase to the target traffic light junction.
    """
    tls_ids = TrafficLightController.discover_tls_ids()
    if id not in tls_ids:
        raise HTTPException(status_code=404, detail=f"Traffic light junction '{id}' not found.")
        
    success = TrafficLightController.apply_action(id, action)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid phase action index or connection lost.")
        
    return {"success": True, "applied_action": action}
