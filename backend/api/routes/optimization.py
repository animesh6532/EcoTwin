from fastapi import APIRouter, HTTPException
from backend.api.schemas import OptimizationConfig, OptimizationStatusResponse
from backend.services.optimization_service import optimization_service

router = APIRouter()

@router.post("/configure", response_model=OptimizationStatusResponse)
def configure_optimization(config: OptimizationConfig):
    try:
        optimization_service.configure(config)
        return optimization_service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/start", response_model=OptimizationStatusResponse)
def start_training():
    try:
        success = optimization_service.start_training()
        if not success:
            raise HTTPException(status_code=400, detail="Training is already in progress.")
        return optimization_service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/stop", response_model=OptimizationStatusResponse)
def stop_training():
    try:
        optimization_service.stop_training()
        return optimization_service.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status", response_model=OptimizationStatusResponse)
def get_status():
    return optimization_service.get_status()
