import os
import json
import joblib
from pathlib import Path
from typing import Dict, Any, List
from stable_baselines3 import PPO
from backend.core.logging import logger

class ModelLoader:
    def __init__(self):
        self.project_root = Path(__file__).resolve().parents[2]
        self.registry_path = self.project_root / "models" / "artifact_registry.json"
        
        # Loaded artifacts cache
        self.feature_schema: Dict[str, Any] = None
        self.ml_model: Any = None
        self.ppo_model: PPO = None
        self.registry: Dict[str, Any] = None
        
        self.loaded = False

    def load_artifacts(self) -> bool:
        """
        Loads all registry artifacts (schema, sklearn ML, stable-baselines PPO).
        Loads once.
        """
        if self.loaded:
            return True
            
        logger.info("Initializing EcoTwin model loader. Reading registry...")
        
        if not self.registry_path.exists():
            raise FileNotFoundError(f"Artifact registry missing at: {self.registry_path}")
            
        try:
            with open(self.registry_path, "r") as f:
                self.registry = json.load(f)
        except Exception as e:
            raise RuntimeError(f"Failed to read artifact registry: {e}")
            
        artifacts = self.registry.get("artifacts", {})
        
        # 1. Load Preprocessing Feature Schema
        schema_info = artifacts.get("preprocessor")
        if not schema_info:
            raise KeyError("Registry missing 'preprocessor' entry.")
        
        schema_path = self.project_root / schema_info["path"]
        if not schema_path.exists():
            raise FileNotFoundError(f"Feature schema missing at: {schema_path}")
            
        with open(schema_path, "r") as f:
            self.feature_schema = json.load(f)
        logger.info(f"Feature schema loaded successfully from {schema_path}")
        
        # 2. Load Supervised ML Model
        ml_info = artifacts.get("ml_model")
        if not ml_info:
            raise KeyError("Registry missing 'ml_model' entry.")
            
        ml_path = self.project_root / ml_info["path"]
        if not ml_path.exists():
            raise FileNotFoundError(f"Supervised ML model missing at: {ml_path}")
            
        try:
            self.ml_model = joblib.load(ml_path)
            logger.info(f"Supervised ML model loaded successfully from {ml_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load ML model: {e}")
            
        # 3. Load PPO Model
        ppo_info = artifacts.get("ppo_model")
        if not ppo_info:
            raise KeyError("Registry missing 'ppo_model' entry.")
            
        ppo_path = self.project_root / ppo_info["path"]
        # PPO path points to .zip file
        if not ppo_path.exists():
            raise FileNotFoundError(f"PPO RL model zip missing at: {ppo_path}")
            
        try:
            self.ppo_model = PPO.load(str(ppo_path))
            logger.info(f"PPO RL model loaded successfully from {ppo_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to load PPO RL model: {e}")
            
        # Verify schema version
        logger.info("Validating model and registry configurations...")
        self.loaded = True
        return True

    def get_feature_schema(self) -> Dict[str, Any]:
        self.load_artifacts()
        return self.feature_schema

    def get_ml_model(self) -> Any:
        self.load_artifacts()
        return self.ml_model

    def get_ppo_model(self) -> PPO:
        self.load_artifacts()
        return self.ppo_model

    def validate_features(self, features_dict: Dict[str, Any]) -> List[Any]:
        """
        Validates feature dict keys and orders them exactly matching the schema.
        Raises ValueError if features are missing.
        """
        schema = self.get_feature_schema()
        expected_features = schema["features"]
        
        ordered_values = []
        for feat in expected_features:
            if feat not in features_dict:
                raise ValueError(f"Missing required feature input: '{feat}'")
            ordered_values.append(features_dict[feat])
            
        return ordered_values

# Singleton instance
model_loader = ModelLoader()
