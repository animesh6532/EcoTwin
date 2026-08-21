import pytest
import numpy as np
from backend.rl.ppo_service import PPOService, PPOCorrectnessError

def test_ppo_service_action():
    service = PPOService()
    
    # Valid observation vector
    obs = np.array([2.0, 1.0, 0.0, 4.0, 0.5, 0.2, 0.0, 1.1], dtype=np.float32)
    action = service.get_action(obs)
    
    assert isinstance(action, int)
    assert action >= 0 and action <= 3

def test_ppo_service_nan_rejection():
    service = PPOService()
    
    # NaN in observation
    obs = np.array([2.0, 1.0, np.nan, 4.0, 0.5, 0.2, 0.0, 1.1], dtype=np.float32)
    with pytest.raises(PPOCorrectnessError):
        service.get_action(obs)

def test_ppo_service_dim_rejection():
    service = PPOService()
    
    # 7 dimensions instead of 8
    obs = np.array([2.0, 1.0, 0.0, 4.0, 0.5, 0.2, 0.0], dtype=np.float32)
    with pytest.raises(PPOCorrectnessError):
        service.get_action(obs)
