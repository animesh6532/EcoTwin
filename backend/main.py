import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api.router import api_router
from backend.websocket.simulation_stream import websocket_endpoint
from backend.core.lifecycle import register_app_lifecycle_events

app = FastAPI(
    title="EcoTwin API Backend",
    description="Intelligent Traffic Optimization and Environmental Analysis Platform",
    version="1.0.0",
)

# CORS Configuration
# frontend URL configured in settings
cors_origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register central routers
app.include_router(api_router, prefix="/api/v1")

# Register live WebSockets streaming state endpoint
app.add_api_websocket_route("/ws/simulation", websocket_endpoint)

# Register App Lifecycle handlers (Startup schemas, shutdown cleanups)
register_app_lifecycle_events(app)

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
