import pytest
from pathlib import Path
from backend.ml.model_loader import ModelLoader

PROJECT_ROOT = Path(__file__).resolve().parents[1]

def test_model_loader_cache():
    loader = ModelLoader()
    # Loader shouldn't be loaded initially
    assert not loader.loaded
    
    # Load artifacts
    success = loader.load_artifacts()
    assert success
    assert loader.loaded
    
    # Verify cached objects are accessible
    assert loader.get_feature_schema() is not None
    assert loader.get_ml_model() is not None
    assert loader.get_ppo_model() is not None

def test_loader_validation_missing_feature():
    loader = ModelLoader()
    loader.load_artifacts()
    
    # Missing rolling_waiting_time
    incomplete_features = {
        "vehicle_count": 5,
        "average_speed": 12.5,
        "total_waiting_time": 45.0,
        "average_waiting_time": 9.0,
        "traffic_flow": 62.5,
        "congestion_indicator": 0,
        "rolling_CO2": 15000.0
    }
    
    with pytest.raises(ValueError) as excinfo:
        loader.validate_features(incomplete_features)
    assert "rolling_waiting_time" in str(excinfo.value)
