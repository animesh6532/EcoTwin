import os
from stable_baselines3 import PPO
from backend.core.config import settings
from backend.core.logging import logger
import numpy as np

class RLInference:
    def __init__(self, model_path: str = None):
        self.model_path = model_path or settings.RL_MODEL_PATH
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path + ".zip"):
            try:
                self.model = PPO.load(self.model_path)
                logger.info(f"RL policy successfully loaded for active inference from {self.model_path}")
            except Exception as e:
                logger.error(f"Error loading PPO model from {self.model_path}: {e}")
        else:
            logger.warning(f"No trained PPO model zip found at {self.model_path}. Inference will fallback to random actions.")

    def predict(self, observation: np.ndarray) -> int:
        if self.model:
            action, _ = self.model.predict(observation, deterministic=True)
            return int(action)
        # Random agent fallback
        return int(np.random.randint(0, 4))
