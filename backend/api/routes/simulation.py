from fastapi import APIRouter, HTTPException, status
from backend.models.schemas import SimulationConfig, SimulationStatus
from backend.services.simulation_service import simulation_service

router = APIRouter()

@router.post("/start", response_model=SimulationStatus, status_code=status.HTTP_200_OK)
def start_simulation(config: SimulationConfig):
    try:
        success = simulation_service.start(config)
        if not success:
            raise HTTPException(status_code=400, detail="Simulation is already running.")
        status_info = simulation_service.get_state()
        return SimulationStatus(
            running=status_info["running"],
            paused=status_info["paused"],
            simulation_time=status_info["step"] * config.step_length,
            vehicle_count=status_info["active_vehicles"],
            controller=status_info["controller"],
            session_id=status_info["session_id"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pause", response_model=SimulationStatus)
def pause_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.pause()
    status_info = simulation_service.get_state()
    return _build_status_response(status_info)

@router.post("/resume", response_model=SimulationStatus)
def resume_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.resume()
    status_info = simulation_service.get_state()
    return _build_status_response(status_info)

@router.post("/step", response_model=SimulationStatus)
def step_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.step()
    status_info = simulation_service.get_state()
    return _build_status_response(status_info)

@router.post("/stop", response_model=SimulationStatus)
def stop_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.stop()
    status_info = simulation_service.get_state()
    return _build_status_response(status_info)

@router.get("/status", response_model=SimulationStatus)
def get_status():
    status_info = simulation_service.get_state()
    return _build_status_response(status_info)

def _build_status_response(status_info: dict) -> SimulationStatus:
    step_len = 0.1
    if simulation_service.config:
        step_len = simulation_service.config.step_length
        
    return SimulationStatus(
        running=status_info["running"],
        paused=status_info["paused"],
        simulation_time=status_info["step"] * step_len,
        vehicle_count=status_info["active_vehicles"],
        controller=status_info["controller"],
        session_id=status_info["session_id"]
    )
