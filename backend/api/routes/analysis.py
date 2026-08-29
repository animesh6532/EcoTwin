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
    if not ppo_session or not baseline_session:
        raise HTTPException(status_code=400, detail="Missing required run ID.")
        
    try:
        comparison = analytics_service.compare_runs(ppo_session, baseline_session)
        return comparison
    except ValueError as e:
        msg = str(e)
        if "UUID format" in msg:
            raise HTTPException(status_code=422, detail=msg)
        elif "not found" in msg:
            raise HTTPException(status_code=404, detail=msg)
        elif "not completed" in msg:
            raise HTTPException(status_code=409, detail=msg)
        elif "different simulation scenarios" in msg:
            raise HTTPException(status_code=400, detail=msg)
        elif "metrics are unavailable" in msg:
            raise HTTPException(status_code=422, detail=msg)
        else:
            raise HTTPException(status_code=400, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected backend error: {str(e)}")

@router.get("/demo-comparison")
def get_demo_comparison():
    """
    Returns the session IDs of the seeded demo runs.
    """
    return {
        "ppo_run_id": "dbd76ae5-cf2d-411a-bf2a-60db028b1859",
        "baseline_run_id": "ca751717-38ee-4b92-a1f7-e4359cd4852c",
        "status": "completed"
    }
