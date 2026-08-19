import gymnasium as gym
from gymnasium import spaces
import numpy as np
import traci
from typing import Dict, Any, Tuple
from backend.simulation.sumo_manager import sumo_manager
from backend.simulation.traci_client import traci_client
from backend.simulation.traffic_lights import TrafficLightsManager
from backend.simulation.traffic_state import TrafficState
from backend.rl.observation_space import get_observation_space, extract_observation
from backend.rl.reward import compute_reward

class EcoTwinEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    def __init__(self, config: Dict[str, Any] = None):
        super().__init__()
        self.config = config or {}
        self.scenario = self.config.get("scenario", "training")
        self.gui = self.config.get("gui", False)
        self.step_length = self.config.get("step_length", 0.1)
        self.max_steps = self.config.get("max_steps", 3600)
        self.current_step = 0
        
        # Action space: select phase for active traffic light (e.g. 4 discrete phases)
        self.action_space = spaces.Discrete(4)
        
        # Observation space: queues, waiting times, emissions
        self.observation_space = get_observation_space()
        
        self.tls_id = "J1"  # Default intersection identifier

    def reset(self, seed=None, options=None) -> Tuple[np.ndarray, Dict[str, Any]]:
        super().reset(seed=seed)
        self.current_step = 0
        
        # Restart SUMO process
        traci_client.close()
        binary = sumo_manager.get_binary_path(self.gui)
        sumocfg = sumo_manager.get_default_config_path(self.scenario)
        traci_client.connect(binary, sumocfg, self.step_length, label=f"rl_{seed or 0}")
        
        # Discover first intersection TLS if not specified
        tls_ids = TrafficLightsManager.get_tls_ids()
        if tls_ids:
            self.tls_id = tls_ids[0]
            
        obs = extract_observation(self.tls_id)
        return obs, {}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        self.current_step += 1
        
        # Apply action (traffic light phase mapping)
        # Phase 0 = NS Green, 1 = NS Yellow, 2 = EW Green, 3 = EW Yellow
        TrafficLightsManager.set_phase(self.tls_id, int(action))
        
        # Simulate multiple frames (e.g., 4 steps = 4 seconds at 1s resolution)
        # Let's run a single simulation frame for simplicity
        traci_client.step()
        
        # Compute state and reward
        obs = extract_observation(self.tls_id)
        reward = compute_reward(self.tls_id)
        
        terminated = self.current_step >= self.max_steps
        truncated = False
        
        info = {
            "step": self.current_step,
            "average_speed": TrafficState.get_average_speed()
        }
        
        return obs, reward, terminated, truncated, info

    def render(self):
        pass

    def close(self):
        traci_client.close()
        super().close()
            
# Registry helper
gym.register(
    id="EcoTwin-v0",
    entry_point="backend.rl.environment:EcoTwinEnv",
)
