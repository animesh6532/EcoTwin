import os
from fastapi import APIRouter
from backend.api.schemas import HealthResponse

router = APIRouter()

@router.get("", response_model=HealthResponse)
def get_health():
    sumo_home = os.environ.get("SUMO_HOME", "")
    sumo_installed = os.path.exists(sumo_home) if sumo_home else False
    
    return HealthResponse(
        status="healthy",
        sumo_home=sumo_home,
        sumo_installed=sumo_installed,
        version="1.0.0"
    )
