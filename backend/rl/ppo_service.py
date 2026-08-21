import numpy as np
from backend.ml.model_loader import model_loader
from backend.simulation.traffic_light_controller import TrafficLightController
from backend.core.logging import logger

class PPOCorrectnessError(ValueError):
    pass

class PPOService:
    def __init__(self):
        # We fetch the singleton loader when needed
        pass

    def get_action(self, observation: np.ndarray) -> int:
        """
        Runs policy inference on the observation vector.
        """
        # Validate observation shape
        if observation.shape != (8,):
            raise PPOCorrectnessError(f"Invalid observation shape {observation.shape}, expected (8,)")
            
        # Check for NaN / Inf
        if np.isnan(observation).any() or np.isinf(observation).any():
            raise PPOCorrectnessError("Observation vector contains NaN or Infinite values.")
            
        try:
            model = model_loader.get_ppo_model()
            action_arr, _ = model.predict(observation, deterministic=True)
            action = int(action_arr.item())
            
            # Validate action range [0, 3]
            if action < 0 or action > 3:
                raise PPOCorrectnessError(f"PPO predicted invalid action phase index: {action}")
                
            return action
        except Exception as e:
            logger.error(f"PPO inference failed: {e}")
            raise e

    def control_intersection(self, tls_id: str, observation: np.ndarray) -> bool:
        """
        Retrieve action from observation and apply it directly to the intersection traffic lights.
        """
        try:
            action = self.get_action(observation)
            success = TrafficLightController.apply_action(tls_id, action)
            return success
        except Exception as e:
            logger.error(f"Failed to control intersection {tls_id}: {e}")
            return False
