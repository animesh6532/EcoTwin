import traci
import numpy as np
from backend.core.logging import logger

class ObservationBuilder:
    def __init__(self, num_lanes: int = 4):
        self.num_lanes = num_lanes
        self.observation_dim = num_lanes * 2 # 8 dimensions (4 queue lengths, 4 waiting times)

    def build_observation(self, tls_id: str) -> np.ndarray:
        """
        Builds observation matching training format:
        - Elements 0 to 3: Halting vehicles count (queue lengths) on first 4 controlled lanes.
        - Elements 4 to 7: Total waiting time in minutes (seconds / 60) on first 4 controlled lanes.
        """
        obs = np.zeros(self.observation_dim, dtype=np.float32)
        if not traci.isLoaded():
            return obs
            
        try:
            # Get unique controlled lanes
            controlled_lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(tls_id)))
            
            # Populate features for up to 4 lanes
            for i in range(min(self.num_lanes, len(controlled_lanes))):
                lane_id = controlled_lanes[i]
                
                # Halt vehicle count (queue length)
                obs[i] = float(traci.lane.getLastStepHaltingNumber(lane_id))
                
                # Waiting time normalized by 60s (minutes)
                obs[i + self.num_lanes] = float(traci.lane.getWaitingTime(lane_id)) / 60.0
        except Exception as e:
            logger.warning(f"Error building observation for traffic light {tls_id}: {e}")
            
        return obs
