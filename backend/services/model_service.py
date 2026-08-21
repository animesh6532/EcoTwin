import os
import json
from pathlib import Path
from typing import Dict, Any

class ModelService:
    @staticmethod
    def get_active_model_info() -> Dict[str, Any]:
        project_root = Path(__file__).resolve().parents[2]
        version_path = project_root / "models" / "metadata" / "model_version.json"
        
        if not version_path.exists():
            return {
                "name": "EcoTwin_PPO",
                "version": "1.0.0",
                "training_date": "2026-08-21T12:16:00Z",
                "feature_version": "1.0.0",
                "status": "inactive"
            }
            
        try:
            with open(version_path, "r") as f:
                info = json.load(f)
            return {
                "name": info.get("project", "EcoTwin"),
                "version": info.get("version", "1.0.0"),
                "training_date": info.get("training_date", "2026-08-21T12:16:00Z"),
                "feature_version": info.get("feature_version", "1.0.0"),
                "status": "active"
            }
        except Exception:
            return {
                "name": "EcoTwin_PPO",
                "version": "1.0.0",
                "training_date": "2026-08-21T12:16:00Z",
                "feature_version": "1.0.0",
                "status": "active"
            }

# Singleton Model Service
model_service = ModelService()
