import numpy as np
from typing import Dict, Any
from backend.ml.model_loader import model_loader
from backend.core.logging import logger

class InferenceService:
    @staticmethod
    def predict_next_step_co2(features_dict: Dict[str, Any]) -> float:
        """
        Validate and predict next-step CO2 emission (mg/s) for a given road segment.
        """
        try:
            # Order features according to schema
            ordered_features = model_loader.validate_features(features_dict)
            
            # Format as 2D array for sklearn input
            X = np.array([ordered_features], dtype=np.float32)
            
            # Get ML model and run prediction
            model = model_loader.get_ml_model()
            prediction = model.predict(X)[0]
            
            return float(prediction)
        except Exception as e:
            logger.error(f"Inference error in predicting next-step CO2: {e}")
            raise e
