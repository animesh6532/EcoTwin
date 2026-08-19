from fastapi import APIRouter, HTTPException, Depends
from backend.api.schemas import SimulationConfig, SimulationStateResponse
from backend.services.simulation_service import simulation_service

router = APIRouter()

@router.post("/start", response_model=SimulationStateResponse)
def start_simulation(config: SimulationConfig):
    try:
        success = simulation_service.start(config)
        if not success:
            raise HTTPException(status_code=400, detail="Simulation is already running.")
        return simulation_service.get_state()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pause", response_model=SimulationStateResponse)
def pause_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.pause()
    return simulation_service.get_state()

@router.post("/resume", response_model=SimulationStateResponse)
def resume_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.resume()
    return simulation_service.get_state()

@router.post("/step", response_model=SimulationStateResponse)
def step_simulation():
    if not simulation_service.is_running():
        raise HTTPException(status_code=400, detail="Simulation is not running.")
    simulation_service.step()
    return simulation_service.get_state()

@router.post("/stop", response_model=SimulationStateResponse)
def stop_simulation():
    simulation_service.stop()
    return simulation_service.get_state()

@router.get("/state", response_model=SimulationStateResponse)
def get_state():
    return simulation_service.get_state()
