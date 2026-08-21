import gymnasium as gym
from gymnasium import spaces
import numpy as np
import traci
import os
import json
from typing import Dict, Any, Tuple
from backend.simulation.sumo_manager import sumo_manager
from backend.simulation.traci_client import traci_client
from backend.simulation.traffic_lights import TrafficLightsManager
from backend.simulation.traffic_state import TrafficState
from backend.rl.observation_space import get_observation_space, extract_observation
from backend.rl.reward_components import calculate_delay_penalty, calculate_emission_penalty

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
        self.tls_id = "center"  # default intersection identifier
        
        self._load_reward_config()

    def _load_reward_config(self):
        # Load reward coefficients dynamically from config file
        config_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "config")
        config_path = os.path.join(config_dir, "reward_config.json")
        try:
            with open(config_path, "r") as f:
                reward_config = json.load(f)
            self.waiting_time_weight = reward_config.get("waiting_time_weight", 0.6)
            self.co2_weight = reward_config.get("co2_weight", 0.4)
        except Exception:
            self.waiting_time_weight = 0.6
            self.co2_weight = 0.4

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
            # We look for 'center' junction as prioritized TLS ID
            if "center" in tls_ids:
                self.tls_id = "center"
            else:
                self.tls_id = tls_ids[0]
            
        obs = extract_observation(self.tls_id)
        return obs, {}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        self.current_step += 1
        
        # Apply action (traffic light phase mapping)
        TrafficLightsManager.set_phase(self.tls_id, int(action))
        
        # Advance simulation
        traci_client.step()
        
        # Compute state and reward
        obs = extract_observation(self.tls_id)
        reward = self.compute_custom_reward()
        
        terminated = self.current_step >= self.max_steps
        truncated = False
        
        info = {
            "step": self.current_step,
            "average_speed": TrafficState.get_average_speed()
        }
        
        return obs, reward, terminated, truncated, info

    def compute_custom_reward(self) -> float:
        if not traci.isLoaded():
            return 0.0
        try:
            controlled_lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(self.tls_id)))
            delay_penalty = calculate_delay_penalty(controlled_lanes)
            emission_penalty = calculate_emission_penalty(controlled_lanes)
            reward = -(self.waiting_time_weight * delay_penalty + self.co2_weight * emission_penalty)
            return float(reward)
        except Exception:
            return 0.0

    def render(self):
        pass

    def close(self):
        traci_client.close()
        super().close()

# Register Gymnasium environment if not already registered
try:
    gym.register(
        id="EcoTwinEnv-v0",
        entry_point="backend.rl.ecotwin_env:EcoTwinEnv",
    )
except Exception:
    pass
