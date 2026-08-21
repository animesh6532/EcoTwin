import os
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

def test_registry_existence():
    registry_path = PROJECT_ROOT / "models" / "artifact_registry.json"
    assert registry_path.exists(), "Artifact registry file is missing!"
    
    with open(registry_path, "r") as f:
        registry = json.load(f)
        
    assert "version" in registry
    assert "artifacts" in registry
    
    artifacts = registry["artifacts"]
    assert "preprocessor" in artifacts
    assert "ml_model" in artifacts
    assert "ppo_model" in artifacts

def test_model_files_existence():
    registry_path = PROJECT_ROOT / "models" / "artifact_registry.json"
    with open(registry_path, "r") as f:
        registry = json.load(f)
        
    artifacts = registry["artifacts"]
    for art_name, art_info in artifacts.items():
        rel_path = art_info["path"]
        abs_path = PROJECT_ROOT / rel_path
        assert abs_path.exists(), f"Artifact file '{art_name}' is missing at: {abs_path}"
