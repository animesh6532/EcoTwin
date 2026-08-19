import os
from stable_baselines3 import PPO
from backend.core.config import settings
from backend.core.logging import logger
from backend.rl.environment import EcoTwinEnv
from backend.rl.ppo_config import get_ppo_hyperparameters
from backend.rl.callbacks import EcoTwinLoggingCallback

def train_agent():
    logger.info("Initializing PPO reinforcement learning training...")
    
    # Create gymnasium environment
    env = EcoTwinEnv(config={
        "scenario": "training",
        "gui": False,  # No GUI during training for speed
        "step_length": settings.SIMULATION_STEP_LENGTH,
        "max_steps": 1000
    })
    
    # Resolve hyperparameters
    hyperparams = get_ppo_hyperparameters()
    
    # Instantiate PPO Agent
    model = PPO(
        policy="MlpPolicy",
        env=env,
        **hyperparams
    )
    
    # Configure callback logging
    checkpoint_dir = "models/ppo/checkpoints"
    callback = EcoTwinLoggingCallback(check_freq=2000, save_path=checkpoint_dir)
    
    # Start learning
    logger.info(f"Starting model learning for {settings.TRAINING_TIMESTEPS} timesteps...")
    model.learn(total_timesteps=settings.TRAINING_TIMESTEPS, callback=callback)
    
    # Save final best model
    best_model_dir = os.path.dirname(settings.RL_MODEL_PATH)
    os.makedirs(best_model_dir, exist_ok=True)
    
    model.save(settings.RL_MODEL_PATH)
    logger.info(f"Training completed successfully. Model saved to: {settings.RL_MODEL_PATH}")
    
    env.close()

if __name__ == "__main__":
    train_agent()
