import os
import json
import joblib
import shutil
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]

def export_pipeline():
    print("=" * 70)
    # Ensure folders exist
    (PROJECT_ROOT / "models" / "preprocessing").mkdir(parents=True, exist_ok=True)
    (PROJECT_ROOT / "models" / "ml").mkdir(parents=True, exist_ok=True)
    (PROJECT_ROOT / "models" / "rl" / "ppo").mkdir(parents=True, exist_ok=True)
    (PROJECT_ROOT / "models" / "metadata").mkdir(parents=True, exist_ok=True)
    
    # 1. Generate Feature Schema
    print("Generating feature schema...")
    features = [
        "vehicle_count", "average_speed", "total_waiting_time", 
        "average_waiting_time", "traffic_flow", "congestion_indicator", 
        "rolling_CO2", "rolling_waiting_time"
    ]
    target = "next_total_CO2"
    
    schema = {
        "features": features,
        "target": target,
        "version": "1.0.0",
        "created_at": "2026-08-21T12:16:00Z"
    }
    
    schema_path = PROJECT_ROOT / "models" / "preprocessing" / "feature_schema.json"
    with open(schema_path, "w") as f:
        json.dump(schema, f, indent=4)
    print(f"Feature schema exported: {schema_path}")
    
    # 2. Train and Export Supervised ML Model
    print("\nTraining supervised ML model on aggregated dataset...")
    features_csv_path = PROJECT_ROOT / "data" / "processed" / "rl_features.csv"
    if not features_csv_path.exists():
        print(f"Error: Aggregated features CSV not found at: {features_csv_path}")
        print("Please run notebooks 01 and 02 first to generate data.")
        sys.exit(1)
        
    df = pd.read_csv(features_csv_path)
    
    # Construct shift target per road
    df["next_total_CO2"] = df.groupby("road_id")["total_CO2"].shift(-1)
    df_ml = df.dropna(subset=["next_total_CO2"]).reset_index(drop=True)
    
    X = df_ml[features]
    y = df_ml[target]
    
    # Time-aware split (80% train, 20% test)
    unique_times = sorted(df_ml["simulation_time"].unique())
    split_idx = int(len(unique_times) * 0.8)
    split_time = unique_times[split_idx]
    
    train_mask = df_ml["simulation_time"] < split_time
    test_mask = ~train_mask
    
    X_train, X_test = X[train_mask], X[test_mask]
    y_train, y_test = y[train_mask], y[test_mask]
    
    # Train Random Forest Regressor
    rf = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))
    
    print(f"Training Complete. Validation Metrics - MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.4f}")
    
    # Save the model
    model_path = PROJECT_ROOT / "models" / "ml" / "pollution_predictor.joblib"
    joblib.dump(rf, model_path)
    print(f"Supervised model exported: {model_path}")
    
    # Generate metadata
    ml_metadata = {
        "model_type": "RandomForestRegressor",
        "features": features,
        "target": target,
        "training_dataset": "data/processed/rl_features.csv",
        "training_date": "2026-08-21T12:16:00Z",
        "metrics": {
            "mae": mae,
            "rmse": rmse,
            "r2": r2
        },
        "library_versions": {
            "scikit-learn": joblib.__version__ if hasattr(joblib, "__version__") else "unknown"
        },
        "model_version": "1.0.0"
    }
    
    metadata_path = PROJECT_ROOT / "models" / "ml" / "metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(ml_metadata, f, indent=4)
    print(f"Model metadata exported: {metadata_path}")
    
    # 3. Copy PPO RL model checkpoint
    print("\nCopying PPO model checkpoint...")
    ppo_src_path = PROJECT_ROOT / "models" / "ppo" / "best_model.zip"
    ppo_dest_path = PROJECT_ROOT / "models" / "rl" / "ppo" / "best_model.zip"
    
    if not ppo_src_path.exists():
        print(f"Warning: Source PPO checkpoint zip not found at: {ppo_src_path}")
        print("Searching for backup in main ppo folder...")
    else:
        shutil.copy2(ppo_src_path, ppo_dest_path)
        print(f"PPO checkpoint copied to: {ppo_dest_path}")
        
    # 4. Generate Registry
    print("\nGenerating artifact registry...")
    registry = {
        "version": "1.0.0",
        "artifacts": {
            "preprocessor": {
                "path": "models/preprocessing/feature_schema.json",
                "type": "json"
            },
            "ml_model": {
                "path": "models/ml/pollution_predictor.joblib",
                "type": "joblib"
            },
            "ppo_model": {
                "path": "models/rl/ppo/best_model.zip",
                "type": "stable_baselines3_zip"
            }
        }
    }
    
    registry_path = PROJECT_ROOT / "models" / "artifact_registry.json"
    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=4)
    print(f"Artifact registry exported: {registry_path}")
    
    # 5. Generate version metadata
    print("\nGenerating versioning details...")
    version_info = {
        "project": "EcoTwin",
        "version": "1.0.0",
        "dataset_version": "SUMO_TAPAS_Cologne_6to8",
        "model_version": "1.0.0",
        "feature_version": "1.0.0",
        "training_date": "2026-08-21T12:16:00Z",
        "python_version": sys.version,
        "library_versions": {
            "pandas": pd.__version__,
            "numpy": np.__version__
        }
    }
    
    version_path = PROJECT_ROOT / "models" / "metadata" / "model_version.json"
    with open(version_path, "w") as f:
        json.dump(version_info, f, indent=4)
    print(f"Model version details exported: {version_path}")
    
    print("\n" + "=" * 70)
    print("ALL ARTIFACTS EXPORTED AND CONFIGURED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    export_pipeline()
