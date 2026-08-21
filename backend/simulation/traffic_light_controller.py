import traci
from typing import List, Dict, Any
from backend.core.logging import logger

class TrafficLightController:
    """
    Handles discovery, state inspection, and phase controls
    for traffic lights in SUMO via TraCI.
    """
    
    @staticmethod
    def discover_tls_ids() -> List[str]:
        if not traci.isLoaded():
            return []
        try:
            return list(traci.trafficlight.getIDList())
        except Exception as e:
            logger.warning(f"Failed to discover traffic light IDs: {e}")
            return []

    @staticmethod
    def get_current_phase(tls_id: str) -> int:
        if not traci.isLoaded():
            return 0
        try:
            return traci.trafficlight.getPhase(tls_id)
        except Exception as e:
            logger.error(f"Failed to get current phase for TLS {tls_id}: {e}")
            return 0

    @staticmethod
    def apply_action(tls_id: str, action: int) -> bool:
        """
        Set traffic light to the target phase.
        """
        if not traci.isLoaded():
            return False
        
        # Validate action bounds (0 to 3)
        if not TrafficLightController.validate_action(tls_id, action):
            logger.warning(f"Invalid phase action index {action} for TLS {tls_id}. Rejecting action.")
            return False
            
        try:
            traci.trafficlight.setPhase(tls_id, int(action))
            return True
        except Exception as e:
            logger.error(f"Failed to apply phase action {action} to TLS {tls_id}: {e}")
            return False

    @staticmethod
    def validate_action(tls_id: str, action: int) -> bool:
        """
        Check if phase index is valid (0 to 3, matching Discrete(4) space).
        """
        if action < 0 or action > 3:
            return False
        return True
