import os
import pytest
from backend.simulation.sumo_manager import sumo_manager

def test_sumo_configs_exist():
    # Verify that primary net, routes, and config files exist in simulation folder
    config_path = sumo_manager.get_default_config_path("normal")
    assert os.path.exists(config_path)
    
    # Net file exists
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    net_path = os.path.join(base_dir, "simulation", "network", "city.net.xml")
    assert os.path.exists(net_path)
