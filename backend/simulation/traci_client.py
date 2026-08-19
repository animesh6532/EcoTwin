import traci
from backend.core.logging import logger

class TraciClient:
    def __init__(self):
        self.connected = False

    def connect(self, binary_path: str, config_path: str, step_length: float = 0.1, label: str = "default"):
        try:
            logger.info(f"Connecting TraCI client using: {binary_path} and config: {config_path}")
            # Start SUMO process and connect
            traci.start([binary_path, "-c", config_path, "--step-length", str(step_length)], label=label)
            self.connected = True
            logger.info(f"TraCI successfully connected with label: {label}")
        except Exception as e:
            self.connected = False
            logger.error(f"Failed to start/connect TraCI client: {e}")
            raise e

    def step(self):
        if self.connected:
            traci.simulationStep()

    def close(self):
        if self.connected:
            try:
                traci.close()
            except Exception as e:
                logger.warning(f"Error during TraCI close: {e}")
            self.connected = False
            logger.info("TraCI client connection closed.")

    def get_version(self) -> str:
        if self.connected:
            try:
                return ".".join(map(str, traci.getVersion()))
            except Exception:
                return "Unknown"
        return "Not Connected"

traci_client = TraciClient()
