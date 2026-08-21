import os
import traci
from fastapi import APIRouter, status, HTTPException
from backend.core.config import settings
from backend.core.database import SessionLocal
from backend.simulation.manager import simulation_manager

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """
    Exposes full health details for all core platform components:
    api, database, sumo, and traci.
    """
    db_status = "healthy"
    db = SessionLocal()
    try:
        # Simple query to verify DB connection
        db.execute("SELECT 1")
    except Exception:
        db_status = "unavailable"
    finally:
        db.close()
        
    sumo_home = os.environ.get("SUMO_HOME", settings.SUMO_HOME)
    sumo_bin_exists = os.path.exists(os.path.join(sumo_home, "bin", "sumo.exe")) if sumo_home else False
    
    traci_status = "healthy" if traci.isLoaded() else "inactive"
    ppo_status = "healthy" if simulation_manager.ppo_service is not None else "inactive"
    
    overall = "healthy"
    if db_status == "unavailable" or not sumo_bin_exists:
        overall = "unavailable"
        
    return {
        "status": overall,
        "components": {
            "api": "healthy",
            "database": db_status,
            "sumo": "healthy" if sumo_bin_exists else "unavailable",
            "traci": traci_status,
            "ppo": ppo_status
        }
    }

@router.get("/ready", status_code=status.HTTP_200_OK)
def readiness_check():
    """
    Returns 200 readiness status if API is ready to accept requests.
    """
    health = health_check()
    if health["status"] != "healthy":
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="EcoTwin is not ready.")
    return {"status": "ready"}
