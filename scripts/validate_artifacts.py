import sys
import numpy as np
from pathlib import Path

# Add project root to sys.path so we can import from backend
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from backend.ml.model_loader import model_loader
from backend.ml.inference_service import InferenceService
from backend.rl.ppo_service import PPOService

def validate_all_artifacts():
    print("=" * 70)
    print("STARTING ecoTwin ARTIFACT VALIDATION CHECKS...")
    print("=" * 70)
    
    # 1. Load all artifacts via loader
    try:
        print("Checking artifact loader...")
        model_loader.load_artifacts()
        print("Artifacts loaded successfully!")
    except Exception as e:
        print(f"Validation FAILED: Loader error: {e}")
        sys.exit(1)
        
    # 2. Check feature schema structure
    try:
        print("\nChecking feature schema configuration...")
        schema = model_loader.get_feature_schema()
        features = schema.get("features", [])
        print(f"Features: {features}")
        assert len(features) == 8, f"Expected 8 features, found {len(features)}"
        assert schema.get("target") == "next_total_CO2", "Target variable name mismatch!"
        print("Feature schema looks valid!")
    except Exception as e:
        print(f"Validation FAILED: Schema validation error: {e}")
        sys.exit(1)
        
    # 3. Test Supervised ML Model inference
    try:
        print("\nChecking supervised ML model inference...")
        test_features = {
            "vehicle_count": 5,
            "average_speed": 12.5,
            "total_waiting_time": 45.0,
            "average_waiting_time": 9.0,
            "traffic_flow": 62.5,
            "congestion_indicator": 0,
            "rolling_CO2": 15000.0,
            "rolling_waiting_time": 25.0
        }
        prediction = InferenceService.predict_next_step_co2(test_features)
        print(f"Sample prediction: {prediction:.2f} mg/s")
        assert np.isfinite(prediction), "Prediction resulted in NaN or Infinite values!"
        print("Supervised ML inference runs cleanly!")
    except Exception as e:
        print(f"Validation FAILED: ML Inference error: {e}")
        sys.exit(1)
        
    # 4. Test PPO Model action prediction
    try:
        print("\nChecking PPO RL policy inference...")
        # 8 dimensions representing: 4 queue lengths, 4 normalized delays
        test_obs = np.array([2.0, 1.0, 0.0, 4.0, 0.5, 0.2, 0.0, 1.1], dtype=np.float32)
        ppo_service = PPOService()
        action = ppo_service.get_action(test_obs)
        print(f"PPO predicted action index: {action}")
        assert action >= 0 and action <= 3, f"PPO Action index {action} out of bounds [0, 3]!"
        print("PPO RL inference runs cleanly!")
    except Exception as e:
        print(f"Validation FAILED: PPO Action Inference error: {e}")
        sys.exit(1)
        
    print("\n" + "=" * 70)
    print("ARTIFACT VALIDATION PASSED")
    print("=" * 70)

if __name__ == "__main__":
    validate_all_artifacts()
