from fastapi import APIRouter, HTTPException, Query
from backend.models.schemas import RLStatus, RLConfig, ModelVersionSchema
from backend.simulation.manager import simulation_manager
from backend.services.model_service import model_service

router = APIRouter()

@router.get("/status", response_model=RLStatus)
def get_rl_status():
    """
    Returns active reinforcement learning PPO policy metrics.
    """
    info = model_service.get_active_model_info()
    return RLStatus(
        active_controller=simulation_manager.controller_type,
        model_version=info.get("version", "1.0.0"),
        mean_reward=float(simulation_manager.last_reward),
        latency_ms=float(simulation_manager.last_latency_ms),
        running=simulation_manager.running and simulation_manager.controller_type == "ppo"
    )

@router.post("/mode", response_model=RLStatus)
def set_rl_mode(config: RLConfig):
    """
    Toggles the active controller mode between 'fixed_time' and 'ppo' in real-time.
    """
    if config.controller_type not in ["fixed_time", "ppo"]:
        raise HTTPException(status_code=400, detail="Controller must be 'fixed_time' or 'ppo'")
        
    simulation_manager.controller_type = config.controller_type
    logger_msg = f"Switched active simulation controller to: {config.controller_type}"
    from backend.core.logging import logger
    logger.info(logger_msg)
    
    return get_rl_status()

@router.get("/model", response_model=ModelVersionSchema)
def get_rl_model_info():
    """
    Exposes metadata about the loaded PPO neural network policy model version.
    """
    info = model_service.get_active_model_info()
    return ModelVersionSchema(
        name=info["name"],
        version=info["version"],
        training_date=info["training_date"],
        feature_version=info["feature_version"],
        status=info["status"]
    )
