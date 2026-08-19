from fastapi import APIRouter, HTTPException
from backend.api.schemas import EmissionsResponse
from backend.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/metrics", response_model=EmissionsResponse)
def get_emissions_metrics():
    try:
        metrics = analytics_service.get_current_emissions_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
