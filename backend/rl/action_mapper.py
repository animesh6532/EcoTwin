from backend.core.logging import logger

class ActionMapper:
    @staticmethod
    def map_action(action: int) -> int:
        """
        Maps discrete PPO action index to target SUMO traffic light phase index.
        The phase indices map 1-to-1 to the phases defined in constants.py.
        """
        # Validate action
        if action < 0 or action > 3:
            logger.warning(f"Out-of-bounds PPO action index {action}. Defaulting to Phase 0.")
            return 0
            
        return int(action)
