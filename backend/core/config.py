import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # SUMO Settings
    SUMO_HOME: str = "C:\\Program Files (x86)\\Eclipse\\Sumo"
    SUMO_GUI: bool = True
    SIMULATION_STEP_LENGTH: float = 0.1
    SIMULATION_DURATION: int = 3600

    # RL Settings
    RL_MODEL_PATH: str = "models/ppo/best_model"
    TRAINING_TIMESTEPS: int = 100000
    LEARNING_RATE: float = 0.0003
    BATCH_SIZE: int = 64
    N_STEPS: int = 2048
    GAMMA: float = 0.99

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
