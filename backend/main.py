import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.core.logging import logger
from backend.api.routes import health, simulation, traffic, emissions, optimization
from backend.api.websocket import websocket_endpoint

app = FastAPI(
    title="EcoTwin API",
    description="Digital Twin Platform for Traffic Control and Urban Carbon Dispersal",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(traffic.router, prefix="/api/traffic", tags=["Traffic"])
app.include_router(emissions.router, prefix="/api/emissions", tags=["Emissions"])
app.include_router(optimization.router, prefix="/api/optimization", tags=["Optimization"])

# Register WebSocket endpoint
app.add_api_websocket_route("/ws", websocket_endpoint)

@app.on_event("startup")
async def startup_event():
    logger.info("EcoTwin Backend starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("EcoTwin Backend shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
