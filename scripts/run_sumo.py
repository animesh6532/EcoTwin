import subprocess
import os
import sys
from backend.core.config import settings
from backend.core.logging import logger
from backend.simulation.sumo_manager import sumo_manager

def main():
    binary = sumo_manager.get_binary_path()
    config = sumo_manager.get_default_config_path()
    
    logger.info(f"Launching SUMO client standalone. Binary: {binary}, Config: {config}")
    try:
        subprocess.run([binary, "-c", config], check=True)
    except Exception as e:
        logger.error(f"SUMO execution encountered error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
