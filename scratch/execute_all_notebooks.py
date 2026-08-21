import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
import sys
import time
from pathlib import Path

notebooks_dir = Path("notebooks")
notebooks_to_run = [
    "01_dataset_audit.ipynb",
    "02_data_cleaning_feature_engineering.ipynb",
    "03_baseline_analysis.ipynb",
    "04_carbon_spatial_analysis.ipynb",
    "05_ml_baseline.ipynb",
    "06_ecotwin_gym_environment.ipynb",
    "07_fixed_time_baseline.ipynb",
    "08_rl_environment_validation.ipynb",
    "09_ppo_training.ipynb",
    "10_ppo_evaluation.ipynb",
    "11_carbon_dispersal_impact.ipynb",
    "12_final_model_report.ipynb"
]

def run_notebook(nb_path):
    print(f"\n==================================================")
    print(f"RUNNING NOTEBOOK: {nb_path.name}")
    print(f"==================================================")
    
    start_time = time.time()
    
    # Read the notebook
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = nbformat.read(f, as_version=4)
        
    # Execute the notebook
    # We set path='notebooks' so that relative paths like '../data/...' inside cells resolve correctly
    ep = ExecutePreprocessor(timeout=600, kernel_name="python3")
    
    try:
        ep.preprocess(nb, {"metadata": {"path": "notebooks"}})
        
        # Save executed notebook
        with open(nb_path, "w", encoding="utf-8") as f:
            nbformat.write(nb, f)
            
        elapsed = time.time() - start_time
        print(f"SUCCESS: {nb_path.name} completed in {elapsed:.2f}s")
        return True
        
    except Exception as e:
        print(f"FAILED: {nb_path.name}")
        print(f"Error details: {e}")
        return False

if __name__ == "__main__":
    success_all = True
    for nb_name in notebooks_to_run:
        nb_path = notebooks_dir / nb_name
        if not nb_path.exists():
            print(f"Error: Notebook not found: {nb_path}")
            sys.exit(1)
            
        success = run_notebook(nb_path)
        if not success:
            success_all = False
            print("Stopping pipeline execution due to notebook failure.")
            sys.exit(1)
            
    if success_all:
        print("\nAll notebooks executed and verified successfully!")
        sys.exit(0)
    else:
        sys.exit(1)
