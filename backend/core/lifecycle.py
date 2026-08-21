import os
import subprocess
from backend.core.logging import logger
from backend.core.database import engine, Base
from backend.ml.model_loader import model_loader
from backend.simulation.manager import simulation_manager

def register_app_lifecycle_events(app):
    @app.on_event("startup")
    async def startup_event():
        logger.info("Initializing EcoTwin database schemas...")
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database schemas initialized successfully.")
        except Exception as e:
            logger.critical(f"Failed to initialize database schemas: {e}")
            
        logger.info("Preloading ML and RL model artifacts...")
        try:
            model_loader.load_artifacts()
            logger.info("Model artifacts loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to preload model artifacts: {e}. (Verify checkpoints exist).")

    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("EcoTwin Backend shutting down. Releasing simulation resources...")
        
        # Stop simulation safely and close TraCI
        try:
            simulation_manager.stop()
            logger.info("TraCI connection closed safely.")
        except Exception as e:
            logger.warning(f"Error closing simulation: {e}")
            
        # Clean up orphan SUMO processes
        clean_sumo_processes()
        
        # Disconnect active WebSockets (ConnectionManager disconnects active sockets gracefully)
        from backend.websocket.manager import manager
        for ws in list(manager.active_connections):
            try:
                await ws.close()
            except Exception:
                pass
            manager.disconnect(ws)
        logger.info("Active WebSocket connections closed.")

def clean_sumo_processes():
    """
    Kills any residual orphan SUMO processes left behind on shutdown.
    """
    logger.info("Cleaning up residual SUMO processes...")
    try:
        if os.name == "nt": # Windows
            subprocess.run(
                ["taskkill", "/F", "/T", "/IM", "sumo.exe"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            subprocess.run(
                ["taskkill", "/F", "/T", "/IM", "sumo-gui.exe"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        else: # Linux / Mac
            subprocess.run(
                ["pkill", "-f", "sumo"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        logger.info("Residual SUMO cleanup completed.")
    except Exception as e:
        logger.warning(f"Failed to execute cleanup command: {e}")
