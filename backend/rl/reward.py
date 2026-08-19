import traci
from backend.rl.reward_components import calculate_delay_penalty, calculate_emission_penalty

def compute_reward(tls_id: str) -> float:
    if not traci.isLoaded():
        return 0.0
        
    try:
        controlled_lanes = list(dict.fromkeys(traci.trafficlight.getControlledLanes(tls_id)))
        
        # 1. Delay Penalty (negative sum of waiting times)
        delay_penalty = calculate_delay_penalty(controlled_lanes)
        
        # 2. Emission Penalty (negative sum of CO2/NOx/PM2.5 emissions)
        emission_penalty = calculate_emission_penalty(controlled_lanes)
        
        # Combined reward formulation: weights normalized to keep values stable
        # r = - (0.6 * delay + 0.4 * emissions)
        reward = -(0.6 * delay_penalty + 0.4 * emission_penalty)
        return float(reward)
    except Exception:
        return 0.0
