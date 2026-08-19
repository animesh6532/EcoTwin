import pytest
from unittest.mock import patch
from backend.rl.reward_components import calculate_delay_penalty, calculate_emission_penalty
from backend.rl.reward import compute_reward

def test_calculate_delay_penalty():
    # Mock traci call to return waiting time
    with patch('traci.lane.getWaitingTime', return_value=120.0):
        val = calculate_delay_penalty(["lane1", "lane2"])
        # Should sum wait time (120+120=240) and scale (/100 = 2.4)
        assert val == 2.4

def test_calculate_emission_penalty():
    with patch('traci.lane.getCO2Emission', return_value=10000.0), \
         patch('traci.lane.getNOxEmission', return_value=1000.0), \
         patch('traci.lane.getPMxEmission', return_value=100.0):
         
         val = calculate_emission_penalty(["lane1"])
         # co2: 10000/10000 = 1.0
         # nox: 1000/1000 = 1.0
         # pm25: 100/100 = 1.0
         # total = 3.0
         assert val == 3.0
