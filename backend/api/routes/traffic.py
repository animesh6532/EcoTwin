from fastapi import APIRouter, HTTPException
from backend.api.schemas import TrafficMetricsResponse
from backend.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/metrics", response_model=TrafficMetricsResponse)
def get_traffic_metrics():
    try:
        metrics = analytics_service.get_current_traffic_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
