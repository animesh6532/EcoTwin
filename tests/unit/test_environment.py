import pytest
from unittest.mock import patch, MagicMock
import numpy as np
from backend.rl.environment import EcoTwinEnv

@patch('backend.simulation.traci_client.traci_client.connect')
@patch('backend.simulation.traci_client.traci_client.close')
@patch('backend.rl.environment.extract_observation', return_value=np.zeros(8, dtype=np.float32))
def test_env_reset(mock_extract, mock_close, mock_connect):
    env = EcoTwinEnv()
    obs, info = env.reset(seed=42)
    
    assert len(obs) == 8
    assert isinstance(info, dict)
    mock_connect.assert_called_once()
