import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

def test_feature_schema_matching():
    schema_path = PROJECT_ROOT / "models" / "preprocessing" / "feature_schema.json"
    assert schema_path.exists()
    
    with open(schema_path, "r") as f:
        schema = json.load(f)
        
    features = schema.get("features", [])
    assert len(features) == 8
    
    # Check feature configuration
    config_path = PROJECT_ROOT / "backend" / "config" / "feature_config.json"
    assert config_path.exists()
    
    with open(config_path, "r") as f:
        config = json.load(f)
        
    config_features = config.get("features", [])
    
    # Verify exact ordering
    assert features == config_features, "Feature lists between schema and config mismatch!"
    
    # Verify order map
    order_map = config.get("feature_order", {})
    for idx, feat in enumerate(features):
        assert order_map[feat] == idx
