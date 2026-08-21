import os
import json
from typing import List
from backend.core.logging import logger
from backend.rl.reward_components import calculate_delay_penalty, calculate_emission_penalty

class RewardService:
    def __init__(self):
        self.waiting_time_weight = 0.6
        self.co2_weight = 0.4
        self._load_config()

    def _load_config(self):
        config_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "config",
            "reward_config.json"
        )
        try:
            with open(config_path, "r") as f:
                reward_config = json.load(f)
            self.waiting_time_weight = reward_config.get("waiting_time_weight", 0.6)
            self.co2_weight = reward_config.get("co2_weight", 0.4)
        except Exception as e:
            logger.warning(f"Failed to load reward configuration: {e}. Using defaults.")

    def compute_reward(self, controlled_lanes: List[str]) -> float:
        """
        Calculates multi-objective rewards dynamically based on config coefficients.
        """
        try:
            # reload config in case it changes
            self._load_config()
            
            delay_penalty = calculate_delay_penalty(controlled_lanes)
            emission_penalty = calculate_emission_penalty(controlled_lanes)
            
            reward = -(self.waiting_time_weight * delay_penalty + self.co2_weight * emission_penalty)
            return float(reward)
        except Exception as e:
            logger.error(f"Failed to calculate reward: {e}")
            return 0.0

# Singleton Reward Service
reward_service = RewardService()
