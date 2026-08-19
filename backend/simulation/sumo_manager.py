import os
import sys
from backend.core.config import settings
from backend.core.logging import logger

class SumoManager:
    def __init__(self):
        self.sumo_home = settings.SUMO_HOME
        self._setup_environment()

    def _setup_environment(self):
        if not self.sumo_home:
            self.sumo_home = os.environ.get("SUMO_HOME", "")
            
        if self.sumo_home:
            os.environ["SUMO_HOME"] = self.sumo_home
            # Add tools to system path
            tools = os.path.join(self.sumo_home, 'tools')
            if tools not in sys.path:
                sys.path.append(tools)
            logger.info(f"SUMO_HOME verified: {self.sumo_home}")
        else:
            logger.warning("SUMO_HOME is not set. SUMO commands may fail if not in system PATH.")

    def get_binary_path(self, force_gui: bool = None) -> str:
        use_gui = settings.SUMO_GUI if force_gui is None else force_gui
        
        # Decide executable
        binary = "sumo-gui" if use_gui else "sumo"
        
        # On Windows, we append .exe
        if sys.platform.startswith("win"):
            binary += ".exe"
            
        # Find absolute path if SUMO_HOME is configured
        if self.sumo_home:
            full_path = os.path.join(self.sumo_home, 'bin', binary)
            if os.path.exists(full_path):
                return full_path
                
        # Fallback to system search
        return binary

    def get_default_config_path(self, scenario: str = "normal") -> str:
        # Resolve config file path
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        config_path = os.path.join(base_dir, "simulation", "config", f"{scenario}.sumocfg")
        if os.path.exists(config_path):
            return config_path
        # Fallback
        return os.path.join(base_dir, "simulation", "config", "city.sumocfg")

sumo_manager = SumoManager()
