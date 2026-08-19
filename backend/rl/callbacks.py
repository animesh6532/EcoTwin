import os
from stable_baselines3.common.callbacks import BaseCallback
from backend.core.logging import logger

class EcoTwinLoggingCallback(BaseCallback):
    def __init__(self, check_freq: int = 1000, save_path: str = "models/ppo/checkpoints", verbose: int = 0):
        super().__init__(verbose)
        self.check_freq = check_freq
        self.save_path = save_path
        os.makedirs(save_path, exist_ok=True)

    def _on_step(self) -> bool:
        # Check frequency trigger
        if self.n_calls % self.check_freq == 0:
            logger.info(f"Step: {self.num_timesteps}. Logging agent metrics...")
            # Save checkpoint
            model_file = os.path.join(self.save_path, f"checkpoint_{self.num_timesteps}_steps.zip")
            self.model.save(model_file)
            logger.info(f"Model checkpoint saved to {model_file}")
            
            # Log episodic reward mean if available
            if len(self.model.ep_info_buffer) > 0:
                mean_reward = float(sum([ep["r"] for ep in self.model.ep_info_buffer]) / len(self.model.ep_info_buffer))
                logger.info(f"Rolling episodic mean reward: {mean_reward:.2f}")
                
        return True
