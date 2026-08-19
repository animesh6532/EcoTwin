import pytest
from unittest.mock import patch
from backend.emissions.co2 import get_co2_emission_for_lane
from backend.emissions.nox import get_nox_emission_for_lane
from backend.emissions.pm25 import get_pm25_emission_for_lane

@patch('traci.isLoaded', return_value=True)
@patch('traci.lane.getCO2Emission', return_value=1245.2)
def test_co2_emission(mock_co2, mock_loaded):
    assert get_co2_emission_for_lane("lane1") == 1245.2

@patch('traci.isLoaded', return_value=True)
@patch('traci.lane.getNOxEmission', return_value=45.6)
def test_nox_emission(mock_nox, mock_loaded):
    assert get_nox_emission_for_lane("lane1") == 45.6

@patch('traci.isLoaded', return_value=True)
@patch('traci.lane.getPMxEmission', return_value=3.4)
def test_pm25_emission(mock_pm25, mock_loaded):
    assert get_pm25_emission_for_lane("lane1") == 3.4
