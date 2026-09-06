from fastapi import APIRouter, HTTPException, Query, status, Depends
from typing import List, Optional
from datetime import datetime
from backend.models.schemas import TrafficLight, TrafficOverrideLogSchema, TrafficOverrideCreate
from backend.models.orm import TrafficOverrideLog
from backend.simulation.traffic_light_controller import TrafficLightController
from backend.simulation.manager import simulation_manager
from backend.core.database import SessionLocal
from sqlalchemy.orm import Session

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=List[str])
def get_traffic_lights():
    """
    Returns list of discovered traffic light IDs in SUMO simulation.
    """
    return TrafficLightController.discover_tls_ids()

@router.get("/overrides/history", response_model=List[TrafficOverrideLogSchema])
def get_override_history(limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    """
    Returns recent manual phase override audit logs from database.
    """
    logs = db.query(TrafficOverrideLog).order_by(TrafficOverrideLog.id.desc()).limit(limit).all()
    result = []
    for l in logs:
        result.append(TrafficOverrideLogSchema(
            id=l.id,
            timestamp=l.timestamp.strftime("%H:%M:%S") if l.timestamp else datetime.utcnow().strftime("%H:%M:%S"),
            session_id=l.session_id,
            junction_id=l.junction_id,
            previous_phase=l.previous_phase,
            new_phase=l.new_phase,
            controller=l.controller,
            duration_sec=l.duration_sec,
            result=l.result,
            user_source=l.user_source,
            error_message=l.error_message
        ))
    return result

@router.get("/{id}", response_model=TrafficLight)
def get_traffic_light(id: str):
    """
    Returns complete dynamic state & telemetries for a specific traffic light junction.
    """
    tls_ids = TrafficLightController.discover_tls_ids()
    if id not in tls_ids:
        raise HTTPException(status_code=404, detail=f"Traffic light junction '{id}' not found.")
        
    controller_type = simulation_manager.controller_type if simulation_manager.running else "fixed_time"
    detail = TrafficLightController.get_full_detail(id, controller_type=controller_type)
    return detail

@router.get("/{id}/state")
def get_traffic_light_state(id: str):
    tls_ids = TrafficLightController.discover_tls_ids()
    if id not in tls_ids:
        raise HTTPException(status_code=404, detail=f"Traffic light junction '{id}' not found.")
        
    timing = TrafficLightController.get_timing_info(id)
    signal_state = TrafficLightController.get_signal_state_map(id)
    return {
        "id": id,
        "phase": timing["active_phase"],
        "phase_name": timing["active_phase_name"],
        "remaining_sec": timing["remaining_sec"],
        "signal_state": signal_state
    }

@router.post("/{id}/action", status_code=status.HTTP_200_OK)
def set_traffic_light_action(
    id: str,
    action: int = Query(..., description="Phase index to set"),
    duration_sec: float = Query(30.0, description="Override duration in seconds"),
    db: Session = Depends(get_db)
):
    """
    Apply safety-validated manual signal phase override and record audit log.
    """
    previous_phase = TrafficLightController.get_current_phase(id)
    is_safe, err_msg = TrafficLightController.validate_override_safety(id, action)
    
    if not is_safe:
        # Record failed override attempt in audit log
        audit = TrafficOverrideLog(
            session_id=simulation_manager.session_id,
            junction_id=id,
            previous_phase=previous_phase,
            new_phase=action,
            controller="MANUAL",
            duration_sec=duration_sec,
            result="FAILED",
            user_source="MANUAL_OPERATOR",
            error_message=err_msg
        )
        db.add(audit)
        db.commit()
        raise HTTPException(status_code=400, detail=err_msg)

    success = TrafficLightController.apply_action(id, action)
    result_str = "SUCCESS" if success else "FAILED"
    err_detail = None if success else "TraCI rejected phase update."

    # Commit audit log to Database
    audit = TrafficOverrideLog(
        session_id=simulation_manager.session_id,
        junction_id=id,
        previous_phase=previous_phase,
        new_phase=action,
        controller="MANUAL",
        duration_sec=duration_sec,
        result=result_str,
        user_source="MANUAL_OPERATOR",
        error_message=err_detail
    )
    db.add(audit)
    db.commit()

    if not success:
        raise HTTPException(status_code=400, detail="Failed to set traffic light phase in SUMO TraCI.")
        
    return {
        "success": True,
        "junction_id": id,
        "previous_phase": previous_phase,
        "applied_phase": action,
        "result": "SUCCESS",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S")
    }

