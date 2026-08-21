from fastapi import APIRouter, Query, HTTPException
from backend.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/compare")
def compare_runs_analysis(
    ppo_session: str = Query(..., description="PPO optimization run session UUID"),
    baseline_session: str = Query(..., description="Fixed-time baseline run session UUID")
):
    """
    Computes comparative analysis details between a PPO optimization session and a Fixed-time baseline session.
    """
    try:
        comparison = analytics_service.compare_runs(ppo_session, baseline_session)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
