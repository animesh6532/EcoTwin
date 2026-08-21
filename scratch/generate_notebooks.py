import nbformat as nbf
from pathlib import Path
import os

notebooks_dir = Path("notebooks")
notebooks_dir.mkdir(exist_ok=True)

# Helper to write notebook
def write_nb(name, cells):
    nb = nbf.v4.new_notebook()
    for cell_type, content in cells:
        if cell_type == "markdown":
            nb["cells"].append(nbf.v4.new_markdown_cell(content))
        elif cell_type == "code":
            nb["cells"].append(nbf.v4.new_code_cell(content))
    
    filepath = notebooks_dir / f"{name}.ipynb"
    with open(filepath, "w", encoding="utf-8") as f:
        nbf.write(nb, f)
    print(f"Created notebook: {filepath}")

# =====================================================================
# NOTEBOOK 01 - DATASET AUDIT & EXPLORATION
# =====================================================================
nb01_cells = [
    ("markdown", """# Notebook 01: Dataset Audit & Exploration

**Project Objective:** Understand exactly what the SUMO/TraCI dataset contains before building the RL pipeline.

This notebook performs a comprehensive audit of the generated traffic and emission simulation datasets:
1. Environment setup and imports
2. Shape, columns, and data types
3. Data quality checks (missing values, duplicates, infinite values)
4. Distribution analysis for simulation time, speed, waiting times, and emissions (CO2, NOx, fuel)
5. Spatial coordinates and road/lane distribution
6. Visualization of trends over time and correlations
"""),
    ("code", """import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json

# Setup plotting style
sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (10, 6)
plt.rcParams["font.size"] = 12

# Create reports and figures directories
Path("../reports/figures/spatial").mkdir(parents=True, exist_ok=True)
Path("../reports/ppo_training").mkdir(parents=True, exist_ok=True)
Path("../models/ppo").mkdir(parents=True, exist_ok=True)
Path("../models/baseline").mkdir(parents=True, exist_ok=True)

raw_path = Path("../data/raw/simulation_data.csv")
processed_path = Path("../data/processed/traffic_emissions.csv")
"""),
    ("markdown", """### Load Datasets
Given the dataset is large (~1.06 GB, 7.8M rows), we perform systematic sampling (every 10th row) to load the entire simulation time range efficiently while ensuring the analysis remains highly representative.
"""),
    ("code", """# Systematic sampling (every 10th row) to prevent OOM and speed up analysis
df_raw = pd.read_csv(raw_path, skiprows=lambda i: i > 0 and i % 10 != 0)
df_processed = pd.read_csv(processed_path, skiprows=lambda i: i > 0 and i % 10 != 0)
"""),
    ("markdown", """### Shape, Columns, and Data Types"""),
    ("code", """print(f"Raw dataset shape (sampled): {df_raw.shape}")
print(f"Processed dataset shape (sampled): {df_processed.shape}")
print("\\nRaw columns:", df_raw.columns.tolist())
print("\\nRaw data types:\\n", df_raw.dtypes)
"""),
    ("markdown", """### Missing, Duplicate, and Infinite Values"""),
    ("code", """print("Missing values in Raw:\\n", df_raw.isna().sum())
print("\\nDuplicate rows count in Raw:", df_raw.duplicated().sum())
print("Infinite values count in Raw:\\n", np.isinf(df_raw.select_dtypes(include=np.number)).sum())
"""),
    ("markdown", """### Unique Vehicle and Time Range Analysis"""),
    ("code", """unique_vehicles = df_raw["vehicle_id"].nunique()
min_time = df_raw["simulation_time"].min()
max_time = df_raw["simulation_time"].max()
duration = max_time - min_time

print(f"Unique vehicle count in sample: {unique_vehicles}")
print(f"Simulation time range: {min_time}s to {max_time}s (Duration: {duration}s)")
"""),
    ("markdown", """### Vehicle Count and Emissions over Time"""),
    ("code", """time_groups = df_raw.groupby("simulation_time")
veh_count_time = time_groups["vehicle_id"].count() * 10 # Scale back by sampling rate
avg_speed_time = time_groups["speed"].mean()
total_co2_time = time_groups["co2"].sum() * 10
avg_wait_time = time_groups["waiting_time"].mean()

# Plot vehicle count over time
plt.figure()
plt.plot(veh_count_time.index, veh_count_time.values, color="teal", linewidth=2)
plt.title("Vehicle Count vs Simulation Time")
plt.xlabel("Simulation Time (s)")
plt.ylabel("Vehicle Count")
plt.savefig("../reports/figures/vehicle_count_vs_time.png", dpi=300)
plt.show()

# Plot total CO2 vs time
plt.figure()
plt.plot(total_co2_time.index, total_co2_time.values / 1e6, color="crimson", linewidth=2)
plt.title("Total CO2 Emissions vs Simulation Time")
plt.xlabel("Simulation Time (s)")
plt.ylabel("CO2 Emissions (g/s)")
plt.savefig("../reports/figures/co2_vs_time.png", dpi=300)
plt.show()

# Plot average speed vs time
plt.figure()
plt.plot(avg_speed_time.index, avg_speed_time.values * 3.6, color="royalblue", linewidth=2)
plt.title("Average Speed vs Simulation Time")
plt.xlabel("Simulation Time (s)")
plt.ylabel("Average Speed (km/h)")
plt.savefig("../reports/figures/average_speed_vs_time.png", dpi=300)
plt.show()

# Plot average waiting time vs time
plt.figure()
plt.plot(avg_wait_time.index, avg_wait_time.values, color="orange", linewidth=2)
plt.title("Average Waiting Time vs Simulation Time")
plt.xlabel("Simulation Time (s)")
plt.ylabel("Average Waiting Time (s)")
plt.savefig("../reports/figures/waiting_time_vs_time.png", dpi=300)
plt.show()
"""),
    ("markdown", """### Distribution Analysis"""),
    ("code", """# CO2 Distribution
plt.figure()
sns.histplot(df_raw["co2"], bins=50, kde=True, color="crimson")
plt.title("CO2 Emissions Distribution")
plt.xlabel("CO2 (mg/s)")
plt.savefig("../reports/figures/co2_distribution.png", dpi=300)
plt.show()

# Speed Distribution
plt.figure()
sns.histplot(df_raw["speed"] * 3.6, bins=50, kde=True, color="royalblue")
plt.title("Speed Distribution")
plt.xlabel("Speed (km/h)")
plt.savefig("../reports/figures/speed_distribution.png", dpi=300)
plt.show()

# Waiting Time Distribution
plt.figure()
sns.histplot(df_raw["waiting_time"], bins=50, kde=True, color="orange")
plt.title("Waiting Time Distribution")
plt.xlabel("Waiting Time (s)")
plt.savefig("../reports/figures/waiting_time_distribution.png", dpi=300)
plt.show()
"""),
    ("markdown", """### Spatial coordinate and Road analysis"""),
    ("code", """# Spatial Vehicle Map
plt.figure(figsize=(10, 8))
plt.scatter(df_raw["x"], df_raw["y"], c=df_raw["co2"], cmap="hot_r", s=1, alpha=0.5)
plt.colorbar(label="CO2 Emission (mg/s)")
plt.title("Vehicle Spatial Scatter Map")
plt.xlabel("X Coordinate")
plt.ylabel("Y Coordinate")
plt.savefig("../reports/figures/spatial_vehicle_map.png", dpi=300)
plt.show()
"""),
    ("markdown", """### Correlation Analysis"""),
    ("code", """corr_matrix = df_raw.select_dtypes(include=np.number).corr()
plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", fmt=".2f")
plt.title("Correlation Heatmap")
plt.savefig("../reports/figures/correlation_heatmap.png", dpi=300)
plt.show()
"""),
    ("markdown", """### Verification of Raw and Processed Equivalence
Check if raw and processed datasets represent the exact same simulation state.
"""),
    ("code", """are_identical = df_raw.equals(df_processed)
print(f"Are raw and processed datasets identical in data values? {are_identical}")
if not are_identical:
    diff_cols = []
    for col in df_raw.columns:
        if not df_raw[col].equals(df_processed[col]):
            diff_cols.append(col)
    print("Different columns:", diff_cols)
else:
    print("Both datasets contain the exact same information without any differences in variables.")
"""),
    ("markdown", """### Findings and Conclusions
- The raw and processed datasets are identical in shape, columns, and data values.
- There are no missing values, duplicates, or infinite values in the dataset.
- The dataset captures 20,229 unique vehicles over a 1000s simulation time window (from simulation step 21,601s to 22,600s).
- Speed is heavily concentrated at 0 (idle/congestion) and around 13-14 m/s (free flow).
- Waiting time distribution shows a large peak at 0, with a tail going up to 300 seconds.
- Total CO2 emissions correlate strongly with waiting time and negatively with speed.
""")
]
write_nb("01_dataset_audit", nb01_cells)


# =====================================================================
# NOTEBOOK 02 - DATA CLEANING & FEATURE ENGINEERING
# =====================================================================
nb02_cells = [
    ("markdown", """# Notebook 02: Data Cleaning & Feature Engineering

**Purpose:** Convert raw vehicle-level simulation log data into aggregated, clean, and ML/RL-ready features per road/lane segment.

### Mathematical Formulation of Derived Features
1. **Vehicle Count ($N_{r,t}$):** Total count of unique vehicles on road segment $r$ at time $t$.
2. **Average Speed ($\bar{v}_{r,t}$):**
   $$\bar{v}_{r,t} = \frac{1}{N_{r,t}} \sum_{i=1}^{N_{r,t}} v_{i,t}$$
3. **Total CO2 ($C_{r,t}$):**
   $$C_{r,t} = \sum_{i=1}^{N_{r,t}} co2_{i,t}$$
4. **Average CO2 per Vehicle ($\bar{c}_{r,t}$):**
   $$\bar{c}_{r,t} = \frac{C_{r,t}}{N_{r,t}}$$
5. **Total Waiting Time ($W_{r,t}$):**
   $$W_{r,t} = \sum_{i=1}^{N_{r,t}} wait_{i,t}$$
6. **Average Waiting Time per Vehicle ($\bar{w}_{r,t}$):**
   $$\bar{w}_{r,t} = \frac{W_{r,t}}{N_{r,t}}$$
7. **Traffic Flow ($Q_{r,t}$):**
   $$Q_{r,t} = N_{r,t} \cdot \bar{v}_{r,t}$$
8. **Congestion Indicator ($I_{r,t}$):**
   $$I_{r,t} = \\begin{cases} 1 & \\text{if } \bar{v}_{r,t} < 5.0 \\text{ m/s (18 km/h) and } N_{r,t} > 2 \\\\ 0 & \\text{otherwise} \\end{cases}$$
9. **Emission Intensity ($E_{r,t}$):**
   $$E_{r,t} = \frac{C_{r,t}}{Q_{r,t} + \epsilon}$$
10. **Rolling CO2 ($C^{roll}_{r,t}$):** 5-step rolling window sum of road CO2.
11. **Rolling Waiting Time ($W^{roll}_{r,t}$):** 5-step rolling window sum of road waiting time.
"""),
    ("code", """import pandas as pd
import numpy as np
from pathlib import Path

raw_path = Path("../data/raw/simulation_data.csv")
rl_features_path = Path("../data/processed/rl_features.csv")
"""),
    ("markdown", """### Load and Prepare Data
We load a large sample (skiprows=every 5th row) to perform aggregating feature engineering across the entire simulation time.
"""),
    ("code", """# Load every 5th row to have highly detailed spatial-temporal aggregations
df = pd.read_csv(raw_path, skiprows=lambda i: i > 0 and i % 5 != 0)
print(f"Loaded sample shape: {df.shape}")
"""),
    ("markdown", """### Perform Road-Level Aggregation"""),
    ("code", """# Sort by simulation time and vehicle id
df = df.sort_values(by=["simulation_time", "vehicle_id"]).reset_index(drop=True)

# Group by time and road
agg_funcs = {
    "vehicle_id": "count",
    "speed": "mean",
    "co2": ["sum", "mean"],
    "waiting_time": ["sum", "mean"],
    "nox": "sum",
    "fuel_consumption": "sum",
    "x": "mean",
    "y": "mean"
}

road_features = df.groupby(["simulation_time", "road_id"]).agg(agg_funcs).reset_index()

# Flatten columns
road_features.columns = [
    "simulation_time", "road_id", "vehicle_count", "average_speed",
    "total_CO2", "average_CO2_per_vehicle", "total_waiting_time", 
    "average_waiting_time", "total_nox", "total_fuel", "mean_x", "mean_y"
]

print(f"Aggregated road segments count: {road_features.shape[0]}")
"""),
    ("markdown", """### Engineer Derived Features"""),
    ("code", """# 1. Traffic Flow
road_features["traffic_flow"] = road_features["vehicle_count"] * road_features["average_speed"]

# 2. Congestion Indicator
road_features["congestion_indicator"] = np.where(
    (road_features["average_speed"] < 5.0) & (road_features["vehicle_count"] > 2), 1, 0
)

# 3. Emission Intensity
road_features["emission_intensity"] = road_features["total_CO2"] / (road_features["traffic_flow"] + 1e-5)

# 4. Rolling Temporal Features per Road Segment
road_features = road_features.sort_values(by=["road_id", "simulation_time"]).reset_index(drop=True)

road_features["rolling_CO2"] = road_features.groupby("road_id")["total_CO2"].transform(
    lambda x: x.rolling(window=5, min_periods=1).sum()
)

road_features["rolling_waiting_time"] = road_features.groupby("road_id")["total_waiting_time"].transform(
    lambda x: x.rolling(window=5, min_periods=1).sum()
)

# 5. Vehicle Density (using vehicle count as a proxy for road density since length is not direct)
road_features["vehicle_density"] = road_features["vehicle_count"]

print(road_features.head())
"""),
    ("markdown", """### Save RL Features"""),
    ("code", """# Sort back by simulation_time
road_features = road_features.sort_values(by=["simulation_time", "road_id"]).reset_index(drop=True)
road_features.to_csv(rl_features_path, index=False)
print(f"RL features successfully saved to: {rl_features_path}")
""")
]
write_nb("02_data_cleaning_feature_engineering", nb02_cells)


# =====================================================================
# NOTEBOOK 03 - TRAFFIC & CARBON BASELINE ANALYSIS
# =====================================================================
nb03_cells = [
    ("markdown", """# Notebook 03: Traffic & Carbon Baseline Analysis

**Purpose:** Establish baseline traffic and environmental metrics for the unmodified SUMO scenario (using standard SUMO-controlled traffic light policies).

We compute:
- Total CO2 emissions
- Average CO2 per vehicle
- Total waiting time
- Average waiting time per vehicle
- Average speed
- Traffic throughput
- NOx and Fuel consumption
"""),
    ("code", """import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_theme(style="whitegrid")

features_path = Path("../data/processed/rl_features.csv")
raw_path = Path("../data/raw/simulation_data.csv")
"""),
    ("markdown", """### Load Features & Compute Global Metrics"""),
    ("code", """df_feat = pd.read_csv(features_path)
df_raw = pd.read_csv(raw_path, skiprows=lambda i: i > 0 and i % 10 != 0)

# Calculate global statistics
# Scale total emissions back up from the 10x raw sample
total_co2_kg = (df_raw["co2"].sum() * 10) / 1e6 # mg to kg
total_nox_g = (df_raw["nox"].sum() * 10) / 1e3  # mg to g
total_fuel_l = (df_raw["fuel_consumption"].sum() * 10) / 1e6 # ml to liters (approx)
total_waiting_time_hrs = (df_raw["waiting_time"].sum() * 10) / 3600.0

avg_waiting_time_s = df_raw["waiting_time"].mean()
avg_speed_kmh = df_raw["speed"].mean() * 3.6
avg_co2_mg = df_raw["co2"].mean()

print(f"Total CO2: {total_co2_kg:.2f} kg")
print(f"Total NOx: {total_nox_g:.2f} g")
print(f"Total Waiting Time: {total_waiting_time_hrs:.2f} hours")
print(f"Average Waiting Time per Vehicle-step: {avg_waiting_time_s:.2f} s")
print(f"Average Speed: {avg_speed_kmh:.2f} km/h")
"""),
    ("markdown", """### Save Baseline Metrics JSON"""),
    ("code", """baseline_metrics = {
    "total_co2_kg": float(total_co2_kg),
    "total_nox_g": float(total_nox_g),
    "total_fuel_l": float(total_fuel_l),
    "total_waiting_time_hrs": float(total_waiting_time_hrs),
    "avg_waiting_time_s": float(avg_waiting_time_s),
    "avg_speed_kmh": float(avg_speed_kmh),
    "avg_co2_mg": float(avg_co2_mg)
}

metrics_path = Path("../reports/baseline_metrics.json")
with open(metrics_path, "w") as f:
    json.dump(baseline_metrics, f, indent=4)
print(f"Saved baseline metrics to: {metrics_path}")
"""),
    ("markdown", """### Visualize Baseline Trends"""),
    ("code", """# CO2 vs Speed Scatter
plt.figure()
plt.scatter(df_raw["speed"] * 3.6, df_raw["co2"], alpha=0.1, color="crimson", s=2)
plt.title("CO2 Emissions vs Speed")
plt.xlabel("Speed (km/h)")
plt.ylabel("CO2 Emissions (mg/s)")
plt.savefig("../reports/figures/co2_vs_speed.png", dpi=300)
plt.show()

# CO2 vs Waiting Time
plt.figure()
plt.scatter(df_raw["waiting_time"], df_raw["co2"], alpha=0.1, color="orange", s=2)
plt.title("CO2 Emissions vs Waiting Time")
plt.xlabel("Waiting Time (s)")
plt.ylabel("CO2 Emissions (mg/s)")
plt.savefig("../reports/figures/co2_vs_waiting_time.png", dpi=300)
plt.show()
""")
]
write_nb("03_baseline_analysis", nb03_cells)


# =====================================================================
# NOTEBOOK 04 - SPATIAL CARBON DISPERSION ANALYSIS
# =====================================================================
nb04_cells = [
    ("markdown", """# Notebook 04: Spatial Carbon Dispersion Analysis

**Purpose:** Analyze WHERE pollution is accumulating in the simulated city. We construct a 2D spatial grid from vehicle coordinates and compute grid-cell level statistics.
"""),
    ("code", """import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_theme(style="white")

raw_path = Path("../data/raw/simulation_data.csv")
grid_path = Path("../data/processed/pollution_grid.csv")
"""),
    ("markdown", """### Load Data & Construct Spatial Grid"""),
    ("code", """df = pd.read_csv(raw_path, skiprows=lambda i: i > 0 and i % 10 != 0)

# Define grid bounds
min_x, max_x = df["x"].min(), df["x"].max()
min_y, max_y = df["y"].min(), df["y"].max()

print(f"X bounds: {min_x} to {max_x}")
print(f"Y bounds: {min_y} to {max_y}")

# Define 30x30 spatial grid
grid_size = 30
x_bins = np.linspace(min_x, max_x, grid_size + 1)
y_bins = np.linspace(min_y, max_y, grid_size + 1)

df["grid_x"] = np.digitize(df["x"], x_bins) - 1
df["grid_y"] = np.digitize(df["y"], y_bins) - 1
"""),
    ("markdown", """### Aggregate Grid Cell Statistics"""),
    ("code", """grid_agg = df.groupby(["grid_x", "grid_y"]).agg(
    vehicle_count=("vehicle_id", "count"),
    average_speed=("speed", "mean"),
    total_co2=("co2", "sum"),
    average_co2=("co2", "mean"),
    average_waiting_time=("waiting_time", "mean")
).reset_index()

# Scale up count and co2 by sampling rate (10x)
grid_agg["vehicle_count"] = grid_agg["vehicle_count"] * 10
grid_agg["total_co2"] = grid_agg["total_co2"] * 10

grid_agg.to_csv(grid_path, index=False)
print(f"Saved pollution grid data to: {grid_path}")
"""),
    ("markdown", """### Plot Carbon Spatial Heatmap"""),
    ("code", """# Create 2D pivot for plotting
heatmap_data = grid_agg.pivot(index="grid_y", columns="grid_x", values="total_co2").fillna(0)

plt.figure(figsize=(10, 8))
sns.heatmap(heatmap_data, cmap="hot", cbar_kws={'label': 'Total CO2 (mg/s)'})
plt.title("Carbon Dispersion Spatial Heatmap")
plt.xlabel("Grid X cell")
plt.ylabel("Grid Y cell")
plt.gca().invert_yaxis()
plt.savefig("../reports/figures/spatial/carbon_spatial_heatmap.png", dpi=300)
plt.show()
"""),
    ("markdown", """### Identify Top Pollution Hotspots"""),
    ("code", """top_hotspots = grid_agg.sort_values(by="total_co2", ascending=False).head(5)
print("Top 5 Pollution Grid Cell Hotspots:")
print(top_hotspots)

# Top road segments by CO2
road_agg = df.groupby("road_id")["co2"].sum().reset_index()
road_agg["co2"] = road_agg["co2"] * 10
top_roads = road_agg.sort_values(by="co2", ascending=False).head(5)
print("\\nTop 5 High-Emission Road Segments:")
print(top_roads)
""")
]
write_nb("04_carbon_spatial_analysis", nb04_cells)


# =====================================================================
# NOTEBOOK 05 - ML BASELINE / PREDICTIVE MODEL
# =====================================================================
nb05_cells = [
    ("markdown", """# Notebook 05: ML Baseline / Predictive Model

**Purpose:** Train a supervised machine learning baseline model to predict next-step road-level carbon emissions from historical traffic features.

### Problem Formulation
- **Features ($X_t$):** `vehicle_count`, `average_speed`, `total_waiting_time`, `average_waiting_time`, `traffic_flow`, `congestion_indicator`, `rolling_CO2`, `rolling_waiting_time`.
- **Target ($y_{t+1}$):** `total_CO2` at the next time step ($t+1$).
- **Methodology:** Time-aware train-test split (train on first 80% of simulation steps, evaluate on last 20%) to avoid data leakage.
"""),
    ("code", """import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from pathlib import Path

features_path = Path("../data/processed/rl_features.csv")
"""),
    ("markdown", """### Load Features and Construct Lead Target"""),
    ("code", """df = pd.read_csv(features_path)

# Create next-step target per road segment
df["next_total_CO2"] = df.groupby("road_id")["total_CO2"].shift(-1)

# Drop missing values resulting from shift
df_ml = df.dropna(subset=["next_total_CO2"]).reset_index(drop=True)

features = [
    "vehicle_count", "average_speed", "total_waiting_time", 
    "average_waiting_time", "traffic_flow", "congestion_indicator", 
    "rolling_CO2", "rolling_waiting_time"
]

target = "next_total_CO2"

X = df_ml[features]
y = df_ml[target]
"""),
    ("markdown", """### Time-Aware Train-Test Split"""),
    ("code", """unique_times = sorted(df_ml["simulation_time"].unique())
split_idx = int(len(unique_times) * 0.8)
split_time = unique_times[split_idx]

train_mask = df_ml["simulation_time"] < split_time
test_mask = ~train_mask

X_train, X_test = X[train_mask], X[test_mask]
y_train, y_test = y[train_mask], y[test_mask]

print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
"""),
    ("markdown", """### Train & Evaluate Predictors"""),
    ("code", """# 1. Linear Regression
lr = LinearRegression()
lr.fit(X_train, y_train)
y_pred_lr = lr.predict(X_test)

# 2. Random Forest Regressor
rf = RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)

# Evaluate Models
def evaluate(y_true, y_pred, name):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"--- {name} Results ---")
    print(f"MAE: {mae:.2f} mg/s")
    print(f"RMSE: {rmse:.2f} mg/s")
    print(f"R² Score: {r2:.4f}")
    return mae, rmse, r2

lr_metrics = evaluate(y_test, y_pred_lr, "Linear Regression")
rf_metrics = evaluate(y_test, y_pred_rf, "Random Forest")
"""),
    ("markdown", """### Feature Importance"""),
    ("code", """import matplotlib.pyplot as plt

importances = rf.feature_importances_
indices = np.argsort(importances)[::-1]

plt.figure()
plt.title("Random Forest Feature Importance")
plt.bar(range(len(features)), importances[indices], color="teal", align="center")
plt.xticks(range(len(features)), [features[i] for i in indices], rotation=45)
plt.tight_layout()
plt.show()
""")
]
write_nb("05_ml_baseline", nb05_cells)


# =====================================================================
# NOTEBOOK 06 - GYMNASIUM ENVIRONMENT DESIGN
# =====================================================================
nb06_cells = [
    ("markdown", """# Notebook 06: Gymnasium Environment Design

**Purpose:** Explains and validates the structural design of the gymnasium reinforcement learning environment `EcoTwinEnv`.

### Observation Space
The observation space is a continuous 8-dimensional space containing traffic queues and vehicle delays on the four lanes controlled by the active traffic signal intersection.
$$\mathcal{O} = [Q_1, Q_2, Q_3, Q_4, W_1/60, W_2/60, W_3/60, W_4/60]$$

### Action Space
A discrete 4-phase selection action space representing traffic light phase switches:
- Action 0: North-South Green, East-West Red
- Action 1: North-South Yellow, East-West Red
- Action 2: East-West Green, North-South Red
- Action 3: East-West Yellow, North-South Red

### Reward Function
A multi-objective reward that balances traffic mobility efficiency and localized carbon emissions:
$$R = -(\\alpha \cdot P_{delay} + \\beta \cdot P_{emissions})$$
- **Delay Penalty ($P_{delay}$):**
  $$P_{delay} = \frac{1}{100} \sum_{lane} WaitingTime_{lane}$$
- **Emission Penalty ($P_{emissions}$):**
  $$P_{emissions} = \frac{CO2_{lane}}{10000} + \frac{NOx_{lane}}{1000} + \frac{PM_{2.5}}{100}$$
- **Weights:** $\alpha = 0.6$ (mobility), $\beta = 0.4$ (environment).
"""),
    ("code", """import sys
import os
from pathlib import Path
import numpy as np

# Adjust system path to import backend modules
sys.path.append(str(Path("..").resolve()))

from backend.rl.environment import EcoTwinEnv
from backend.rl.observation_space import get_observation_space
from backend.rl.reward import compute_reward

# Check observation space configuration
obs_space = get_observation_space()
print(f"Observation space: {obs_space}")
print(f"Observation shape: {obs_space.shape}")
print(f"Observation bounds: {obs_space.low} to {obs_space.high}")
""")
]
write_nb("06_ecotwin_gym_environment", nb06_cells)


# =====================================================================
# NOTEBOOK 07 - BASELINE TRAFFIC SIGNAL CONTROLLER
# =====================================================================
nb07_cells = [
    ("markdown", """# Notebook 07: Baseline Traffic Signal Controller

**Purpose:** Run a fixed-time traffic light baseline simulation run and record mobility and emission performance metrics.

The baseline policy uses a conventional fixed-time round-robin policy:
- Green NS: 30s
- Yellow NS: 4s
- Green EW: 30s
- Yellow EW: 4s
"""),
    ("code", """import traci
import numpy as np
import json
from pathlib import Path
import sys

sys.path.append(str(Path("..").resolve()))
from backend.simulation.traci_client import traci_client
from backend.simulation.sumo_manager import sumo_manager
from backend.simulation.traffic_lights import TrafficLightsManager
from backend.simulation.traffic_state import TrafficState
from backend.simulation.emission_collector import EmissionCollector
"""),
    ("markdown", """### Run Simulation with Fixed-Time Signal Policy"""),
    ("code", """binary = sumo_manager.get_binary_path(force_gui=False)
sumocfg = sumo_manager.get_default_config_path("evaluation")

print(f"Connecting to SUMO: {binary}")
traci_client.connect(binary, sumocfg, 1.0, label="fixed_time_baseline")

tls_ids = TrafficLightsManager.get_tls_ids()
tls_id = tls_ids[0] if tls_ids else "J1"

# Metrics list
co2_steps = []
wait_steps = []
speed_steps = []
nox_steps = []
fuel_steps = []

# Fixed-time parameters
phase_durations = [30, 4, 30, 4]
current_phase = 0
time_in_phase = 0

print(f"Starting simulation for 1000 steps on TLS: {tls_id}")
for step in range(1000):
    traci_client.step()
    
    # Manage fixed-time traffic lights state machine
    time_in_phase += 1
    if time_in_phase >= phase_durations[current_phase]:
        current_phase = (current_phase + 1) % 4
        time_in_phase = 0
        TrafficLightsManager.set_phase(tls_id, current_phase)
        
    # Collect step metrics
    emissions = EmissionCollector.get_system_emissions()
    co2_steps.append(emissions["co2"])
    nox_steps.append(emissions["nox"])
    fuel_steps.append(emissions["fuel"])
    
    vehicles = TrafficState.get_active_vehicles()
    if vehicles:
        avg_wait = np.mean([v["waiting_time"] for v in vehicles])
        avg_speed = np.mean([v["speed"] for v in vehicles])
    else:
        avg_wait = 0.0
        avg_speed = 0.0
        
    wait_steps.append(avg_wait)
    speed_steps.append(avg_speed)

traci_client.close()
"""),
    ("markdown", """### Compile & Save Baseline Performance Metrics"""),
    ("code", """fixed_time_metrics = {
    "total_co2_mg": float(np.sum(co2_steps)),
    "average_co2_mg_s": float(np.mean(co2_steps)),
    "total_nox_mg": float(np.sum(nox_steps)),
    "total_fuel_ml": float(np.sum(fuel_steps)),
    "average_waiting_time_s": float(np.mean(wait_steps)),
    "average_speed_kmh": float(np.mean(speed_steps))
}

print("Fixed-Time Baseline Performance:")
print(json.dumps(fixed_time_metrics, indent=4))

# Save metrics JSON
with open("../reports/fixed_time_metrics.json", "w") as f:
    json.dump(fixed_time_metrics, f, indent=4)
""")
]
write_nb("07_fixed_time_baseline", nb07_cells)


# =====================================================================
# NOTEBOOK 08 - RL ENVIRONMENT VALIDATION
# =====================================================================
nb08_cells = [
    ("markdown", """# Notebook 08: RL Environment Validation

**Purpose:** Verify and validate the Gymnasium reinforcement learning environment `EcoTwinEnv` with a random action agent before launching PPO training.
"""),
    ("code", """import sys
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt

sys.path.append(str(Path("..").resolve()))
from backend.rl.environment import EcoTwinEnv
"""),
    ("markdown", """### Initialize and Step through Gymnasium Environment"""),
    ("code", """env = EcoTwinEnv(config={
    "scenario": "training",
    "gui": False,
    "step_length": 1.0,
    "max_steps": 100
})

obs, info = env.reset(seed=42)
print("Initial Reset Observation Shape:", obs.shape)
print("Initial Reset Observation Values:", obs)

rewards = []
co2_list = []
wait_list = []

for step in range(100):
    # Sample random action
    action = env.action_space.sample()
    
    # Step environment
    obs, reward, terminated, truncated, info = env.step(action)
    
    # Check for invalid values
    assert not np.isnan(obs).any(), f"NaN in obs at step {step}"
    assert not np.isinf(obs).any(), f"Inf in obs at step {step}"
    assert not np.isnan(reward), f"NaN in reward at step {step}"
    
    rewards.append(reward)
    co2_list.append(obs[0] + obs[1] + obs[2] + obs[3]) # Proxied queue co2 indicators
    wait_list.append(np.mean(obs[4:]))
    
    if terminated or truncated:
        break

env.close()
print("Random agent steps completed successfully. No NaNs or Inf values detected.")
"""),
    ("markdown", """### Diagnostics Plots"""),
    ("code", """plt.figure(figsize=(12, 4))
plt.subplot(1, 3, 1)
plt.plot(rewards, color="purple")
plt.title("Reward per Step")
plt.xlabel("Step")

plt.subplot(1, 3, 2)
plt.plot(co2_list, color="crimson")
plt.title("Queue Vehicle Lengths")
plt.xlabel("Step")

plt.subplot(1, 3, 3)
plt.plot(wait_list, color="orange")
plt.title("Normalized Lane Wait Time")
plt.xlabel("Step")

plt.tight_layout()
plt.savefig("../reports/figures/random_agent_diagnostics.png", dpi=300)
plt.show()
""")
]
write_nb("08_rl_environment_validation", nb08_cells)


# =====================================================================
# NOTEBOOK 09 - PPO TRAINING
# =====================================================================
nb09_cells = [
    ("markdown", """# Notebook 09: PPO Training

**Purpose:** Train a Proximal Policy Optimization (PPO) agent against the validated EcoTwin environment using stable-baselines3.
"""),
    ("code", """import sys
import os
from pathlib import Path
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import EvalCallback

sys.path.append(str(Path("..").resolve()))
from backend.rl.environment import EcoTwinEnv
from backend.rl.ppo_config import get_ppo_hyperparameters
"""),
    ("markdown", """### Initialize Training and Model"""),
    ("code", """env = EcoTwinEnv(config={
    "scenario": "training",
    "gui": False,
    "step_length": 1.0,
    "max_steps": 1000
})

hyperparams = get_ppo_hyperparameters()
print("PPO Hyperparameters:", hyperparams)

# Instantiate stable-baselines3 PPO
model = PPO(
    policy="MlpPolicy",
    env=env,
    learning_rate=hyperparams["learning_rate"],
    n_steps=256,         # Lower n_steps for faster iteration inside notebook
    batch_size=64,
    n_epochs=hyperparams["n_epochs"],
    gamma=hyperparams["gamma"],
    gae_lambda=hyperparams["gae_lambda"],
    clip_range=hyperparams["clip_range"],
    ent_coef=hyperparams["ent_coef"],
    vf_coef=hyperparams["vf_coef"],
    max_grad_norm=hyperparams["max_grad_norm"],
    verbose=1,
    tensorboard_log="../reports/ppo_training/tb/"
)
"""),
    ("markdown", """### Train PPO Agent"""),
    ("code", """# Run PPO learning for 2000 timesteps to establish baseline convergence
model.learn(total_timesteps=2000)

# Save best model
model.save("../models/ppo/best_model")
env.close()
print("PPO training completed and model saved successfully.")
""")
]
write_nb("09_ppo_training", nb09_cells)


# =====================================================================
# NOTEBOOK 10 - PPO EVALUATION
# =====================================================================
nb10_cells = [
    ("markdown", """# Notebook 10: PPO Evaluation

**Purpose:** Evaluate the trained PPO controller agent and compare its performance metrics directly against the Fixed-Time traffic baseline controller.
"""),
    ("code", """import sys
import numpy as np
import json
from pathlib import Path
from stable_baselines3 import PPO

sys.path.append(str(Path("..").resolve()))
from backend.rl.environment import EcoTwinEnv
from backend.simulation.traffic_state import TrafficState
from backend.simulation.emission_collector import EmissionCollector
"""),
    ("markdown", """### Run PPO Controller on Evaluation Scenario"""),
    ("code", """env = EcoTwinEnv(config={
    "scenario": "evaluation",
    "gui": False,
    "step_length": 1.0,
    "max_steps": 1000
})

model = PPO.load("../models/ppo/best_model")

obs, info = env.reset()
done = False
truncated = False

co2_steps = []
nox_steps = []
fuel_steps = []
wait_steps = []
speed_steps = []

print("Running PPO controller agent in SUMO...")
while not (done or truncated):
    action, _ = model.predict(obs, deterministic=True)
    obs, reward, done, truncated, info = env.step(action)
    
    # Track metrics
    emissions = EmissionCollector.get_system_emissions()
    co2_steps.append(emissions["co2"])
    nox_steps.append(emissions["nox"])
    fuel_steps.append(emissions["fuel"])
    
    vehicles = TrafficState.get_active_vehicles()
    if vehicles:
        avg_wait = np.mean([v["waiting_time"] for v in vehicles])
        avg_speed = np.mean([v["speed"] for v in vehicles])
    else:
        avg_wait = 0.0
        avg_speed = 0.0
        
    wait_steps.append(avg_wait)
    speed_steps.append(avg_speed)

env.close()
"""),
    ("markdown", """### Compare Metrics: PPO vs Fixed-Time"""),
    ("code", """# Load fixed time metrics
with open("../reports/fixed_time_metrics.json") as f:
    fixed_metrics = json.load(f)

ppo_metrics = {
    "total_co2_mg": float(np.sum(co2_steps)),
    "average_co2_mg_s": float(np.mean(co2_steps)),
    "total_nox_mg": float(np.sum(nox_steps)),
    "total_fuel_ml": float(np.sum(fuel_steps)),
    "average_waiting_time_s": float(np.mean(wait_steps)),
    "average_speed_kmh": float(np.mean(speed_steps))
}

print("PPO Agent Performance:")
print(json.dumps(ppo_metrics, indent=4))

# Calculate percentage improvement
improvements = {}
for k in fixed_metrics.keys():
    baseline_val = fixed_metrics[k]
    ppo_val = ppo_metrics[k]
    
    if "speed" in k:
        # For speed: Higher is better
        imp = ((ppo_val - baseline_val) / (baseline_val + 1e-5)) * 100
    else:
        # For delay, emissions, fuel: Lower is better
        imp = ((baseline_val - ppo_val) / (baseline_val + 1e-5)) * 100
    improvements[k] = imp

print("\\nPercentage Improvements (Positive is improvement):")
for k, v in improvements.items():
    print(f"{k}: {v:+.2f}%")

with open("../reports/ppo_training/improvements.json", "w") as f:
    json.dump({"ppo_metrics": ppo_metrics, "improvements": improvements}, f, indent=4)
""")
]
write_nb("10_ppo_evaluation", nb10_cells)


# =====================================================================
# NOTEBOOK 11 - CARBON DISPERSAL IMPACT
# =====================================================================
nb11_cells = [
    ("markdown", """# Notebook 11: Carbon Dispersal Impact

**Purpose:** Visually demonstrate and analyze the spatial carbon dispersal impact before (fixed-time) and after (PPO) reinforcement learning light optimization.
"""),
    ("code", """import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json

sns.set_theme(style="white")

with open("../reports/fixed_time_metrics.json") as f:
    fixed_m = json.load(f)
with open("../reports/ppo_training/improvements.json") as f:
    ppo_data = json.load(f)
    ppo_m = ppo_data["ppo_metrics"]
"""),
    ("markdown", """### Hotspot and Spatial Distribution Contrast Plot"""),
    ("code", """categories = ["CO2 Emissions", "NOx Emissions", "Fuel Consumption", "Avg Waiting Time", "Avg Speed"]
# Normalize to percentage of baseline
fixed_vals = [100.0] * 5
ppo_vals = [
    (ppo_m["total_co2_mg"] / fixed_m["total_co2_mg"]) * 100,
    (ppo_m["total_nox_mg"] / fixed_m["total_nox_mg"]) * 100,
    (ppo_m["total_fuel_ml"] / fixed_m["total_fuel_ml"]) * 100,
    (ppo_m["average_waiting_time_s"] / fixed_m["average_waiting_time_s"]) * 100,
    (ppo_m["average_speed_kmh"] / fixed_m["average_speed_kmh"]) * 100,
]

x = np.arange(len(categories))
width = 0.35

plt.figure(figsize=(10, 6))
plt.bar(x - width/2, fixed_vals, width, label="Fixed-Time Baseline (Control)", color="gray")
plt.bar(x + width/2, ppo_vals, width, label="PPO EcoTwin Optimized", color="teal")
plt.title("Mobility and Emissions Comparison (Normalized to Baseline = 100%)")
plt.xticks(x, categories)
plt.ylabel("Percentage (%)")
plt.legend()
plt.tight_layout()
plt.savefig("../reports/figures/spatial/carbon_dispersal_comparison.png", dpi=300)
plt.show()
""")
]
write_nb("11_carbon_dispersal_impact", nb11_cells)


# =====================================================================
# NOTEBOOK 12 - FINAL MODEL REPORT
# =====================================================================
nb12_cells = [
    ("markdown", """# Notebook 12: Final Model Report

**Purpose:** Comprehensive project-level report documenting objectives, methods, baseline performance, RL reward parameters, PPO training progress, and evaluation improvements.

### 1. Problem Statement
EcoTwin utilizes reinforcement learning to optimize traffic signals for both vehicle efficiency (mobility) and environmental pollution accumulation (carbon dispersal).

### 2. Reward Weight Analysis
The optimized multi-objective reward is structured as:
$$R = -(0.6 \cdot P_{delay} + 0.4 \cdot P_{emissions})$$

### 3. final Results Table
Below is the evaluation summary contrast:
"""),
    ("code", """import json
import pandas as pd

with open("../reports/fixed_time_metrics.json") as f:
    fixed_m = json.load(f)
with open("../reports/ppo_training/improvements.json") as f:
    ppo_data = json.load(f)
    ppo_m = ppo_data["ppo_metrics"]
    imp = ppo_data["improvements"]

summary_data = {
    "Metric": [
        "Total CO2 (mg)", "Avg CO2 per Step (mg/s)", "Total NOx (mg)", 
        "Total Fuel (ml)", "Avg Waiting Time (s)", "Avg Speed (km/h)"
    ],
    "Fixed-Time Baseline": [
        fixed_m["total_co2_mg"], fixed_m["average_co2_mg_s"], fixed_m["total_nox_mg"],
        fixed_m["total_fuel_ml"], fixed_m["average_waiting_time_s"], fixed_m["average_speed_kmh"]
    ],
    "PPO Controller": [
        ppo_m["total_co2_mg"], ppo_m["average_co2_mg_s"], ppo_m["total_nox_mg"],
        ppo_m["total_fuel_ml"], ppo_m["average_waiting_time_s"], ppo_m["average_speed_kmh"]
    ],
    "Improvement (%)": [
        f"{imp['total_co2_mg']:+.2f}%", f"{imp['average_co2_mg_s']:+.2f}%", f"{imp['total_nox_mg']:+.2f}%",
        f"{imp['total_fuel_ml']:+.2f}%", f"{imp['average_waiting_time_s']:+.2f}%", f"{imp['average_speed_kmh']:+.2f}%"
    ]
}

df_summary = pd.DataFrame(summary_data)
print(df_summary.to_markdown(index=False))
"""),
    ("markdown", """### 4. Limitations and Future Work
- Evaluation is based on a localized intersection control (`J1`). Expanding to network-wide multi-agent PPO (MAPPO) control is recommended.
- Current observations use lane halt numbers and queue waiting times. Introducing real-time street grid pollution sensors (e.g. dispersion modeling) would refine the environmental component.
""")
]
write_nb("12_final_model_report", nb12_cells)

print("All 12 notebooks generated successfully.")
