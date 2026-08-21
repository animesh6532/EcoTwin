import pandas as pd
import numpy as np
import os

raw_path = r"d:\Infotact_Solutions\EcoTwin\data\raw\simulation_data.csv"
proc_path = r"d:\Infotact_Solutions\EcoTwin\data\processed\traffic_emissions.csv"

def inspect_file(filepath, name):
    print(f"\n==================== INSPECTING {name} ====================")
    print(f"Path: {filepath}")
    
    # Read just a small sample first to check columns and types
    df_sample = pd.read_csv(filepath, nrows=5)
    print("Columns:", list(df_sample.columns))
    print("Sample Data:\n", df_sample)
    
    # Let's count lines to get shape without reading the whole file in memory if it's too large,
    # or read it in chunks or fully if we have enough memory.
    # Since it's 1.1GB, it might contain ~10-20 million rows. Let's see how much memory we have.
    # Let's check size in bytes
    size_gb = os.path.getsize(filepath) / (1024**3)
    print(f"File size: {size_gb:.3f} GB")
    
    # Let's read in chunks to get aggregate statistics
    chunk_size = 500000
    row_count = 0
    missing_counts = {}
    dtypes = None
    min_values = {}
    max_values = {}
    unique_vehicles = set()
    min_time = float('inf')
    max_time = float('-inf')
    co2_sum = 0
    speed_sum = 0
    wait_sum = 0
    nox_sum = 0
    fuel_sum = 0
    duplicate_sample_count = 0
    
    print("Reading file in chunks...")
    for chunk in pd.read_csv(filepath, chunksize=chunk_size):
        row_count += len(chunk)
        if dtypes is None:
            dtypes = chunk.dtypes
            
        # Count missing values
        for col in chunk.columns:
            missing_counts[col] = missing_counts.get(col, 0) + chunk[col].isna().sum()
            
            # Numeric stats
            if pd.api.types.is_numeric_dtype(chunk[col]):
                chunk_min = chunk[col].min()
                chunk_max = chunk[col].max()
                if col not in min_values or chunk_min < min_values[col]:
                    min_values[col] = chunk_min
                if col not in max_values or chunk_max > max_values[col]:
                    max_values[col] = chunk_max
        
        # Unique vehicle IDs (if column exists)
        if 'vehicle_id' in chunk.columns:
            unique_vehicles.update(chunk['vehicle_id'].unique())
        elif 'id' in chunk.columns:
            unique_vehicles.update(chunk['id'].unique())
            
        # Simulation time range (if column exists)
        time_col = None
        for tc in ['simulation_time', 'time', 'step']:
            if tc in chunk.columns:
                time_col = tc
                break
        if time_col is not None:
            min_time = min(min_time, chunk[time_col].min())
            max_time = max(max_time, chunk[time_col].max())
            
    print(f"Total Rows: {row_count}")
    print(f"Data Types:\n{dtypes}")
    print(f"Missing Values:\n{missing_counts}")
    print(f"Min Values:\n{min_values}")
    print(f"Max Values:\n{max_values}")
    print(f"Unique vehicles count: {len(unique_vehicles)}")
    print(f"Simulation time range: {min_time} to {max_time}")

if __name__ == "__main__":
    inspect_file(raw_path, "RAW DATA")
    inspect_file(proc_path, "PROCESSED DATA")
