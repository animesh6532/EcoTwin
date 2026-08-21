import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    LOG_LEVEL: str = "info"
    FRONTEND_URL: str = "http://localhost:3000"

    # SUMO Settings
    SUMO_HOME: str = "C:\\Program Files (x86)\\Eclipse\\Sumo"
    SUMO_BINARY: str = "sumo-gui"
    SUMO_GUI: bool = True
    SIMULATION_STEP_LENGTH: float = 0.1
    SIMULATION_DURATION: int = 3600
    WEBSOCKET_INTERVAL: float = 1.0

    # Database Settings
    DATABASE_URL: str = "sqlite:///./ecotwin.db"

    # RL Settings
    RL_MODEL_PATH: str = "models/rl/ppo/best_model.zip"
    TRAINING_TIMESTEPS: int = 100000
    LEARNING_RATE: float = 0.0003
    BATCH_SIZE: int = 64
    N_STEPS: int = 2048
    GAMMA: float = 0.99
    MODEL_VERSION: str = "1.0.0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
