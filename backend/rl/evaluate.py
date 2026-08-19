import numpy as np
from backend.core.config import settings
from backend.core.logging import logger
from backend.rl.environment import EcoTwinEnv
from stable_baselines3 import PPO

def evaluate_agent(episodes: int = 5):
    logger.info("Starting RL agent evaluation runs...")
    
    env = EcoTwinEnv(config={
        "scenario": "evaluation",
        "gui": False,
        "step_length": settings.SIMULATION_STEP_LENGTH,
        "max_steps": 1000
    })
    
    # Load model
    try:
        model = PPO.load(settings.RL_MODEL_PATH)
        logger.info(f"Loaded trained policy from {settings.RL_MODEL_PATH}")
    except Exception as e:
        logger.error(f"Failed to load policy: {e}. Running evaluation with random policy.")
        model = None
        
    all_rewards = []
    
    for ep in range(episodes):
        obs, _ = env.reset()
        done = False
        truncated = False
        ep_reward = 0.0
        
        while not (done or truncated):
            if model:
                action, _ = model.predict(obs, deterministic=True)
            else:
                action = env.action_space.sample()
                
            obs, reward, done, truncated, info = env.step(action)
            ep_reward += reward
            
        all_rewards.append(ep_reward)
        logger.info(f"Episode {ep + 1} completed. Reward: {ep_reward:.2f}")
        
    logger.info(f"Evaluation complete. Mean episodic reward: {np.mean(all_rewards):.2f}")
    env.close()

if __name__ == "__main__":
    evaluate_agent()
