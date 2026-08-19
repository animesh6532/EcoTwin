import traci
from gymnasium import spaces
import numpy as np
from backend.core.logging import logger

def get_observation_space() -> spaces.Box:
    # 8 features: Queue lengths on 4 lanes, Waiting times on 4 lanes
    return spaces.Box(
        low=0.0,
        high=100.0,
        shape=(8,),
        dtype=np.float32
    )

def extract_observation(tls_id: str) -> np.ndarray:
    obs = np.zeros(8, dtype=np.float32)
    if not traci.isLoaded():
        return obs
        
    try:
        # Get lanes controlled by the traffic signal
        controlled_lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(tls_id)))
        
        # Take first 4 lanes (or pad if fewer)
        for i in range(min(4, len(controlled_lanes))):
            lane_id = controlled_lanes[i]
            # Feature 0-3: Halting vehicles (queues)
            obs[i] = float(traci.lane.getLastStepHaltingNumber(lane_id))
            # Feature 4-7: Total waiting time of vehicles in lane
            obs[i + 4] = float(traci.lane.getWaitingTime(lane_id)) / 60.0 # Normalized by 60s
    except Exception as e:
        logger.warning(f"Error extracting observation features for TLS {tls_id}: {e}")
        
    return obs
