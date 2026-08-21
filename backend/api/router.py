from fastapi import APIRouter
from backend.api.routes import health, simulation, vehicles, emissions, traffic_lights, rl, metrics, analysis

api_router = APIRouter()

# Include all routes under /api/v1 prefix
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])
api_router.include_router(emissions.router, prefix="/emissions", tags=["Emissions"])
api_router.include_router(traffic_lights.router, prefix="/traffic-lights", tags=["Traffic Lights"])
api_router.include_router(rl.router, prefix="/rl", tags=["Reinforcement Learning"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analytics"])
