import numpy as np
from backend.rl.observation_builder import ObservationBuilder

def test_observation_builder_dimensions():
    builder = ObservationBuilder()
    assert builder.observation_dim == 8
    
    # Test observation generation when TraCI is not running/loaded (should return zeros)
    obs = builder.build_observation("center")
    assert isinstance(obs, np.ndarray)
    assert obs.shape == (8,)
    assert obs.dtype == np.float32
    assert (obs == 0.0).all()
