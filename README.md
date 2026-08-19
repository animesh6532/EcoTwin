# EcoTwin

EcoTwin is a state-of-the-art digital twin platform designed for **Urban Carbon Dispersal and Traffic Signal Control** using Reinforcement Learning (RL). By integrating **FastAPI**, **SUMO (Simulation of Urban MObility)**, and **Stable-Baselines3 (PPO)**, EcoTwin optimizes traffic light phase patterns to minimize wait times, grid congestion, and vehicle carbon emissions (CO2, NOx, PM2.5).

```mermaid
graph TD
    subgraph Frontend (Vite + React + TS)
        UI[Dashboard / Simulation View] <--> WS_Client[WebSocket Service]
    end
    
    subgraph Backend (FastAPI)
        API[API Endpoints] --> Serv[Services Layer]
        WS[WebSocket Endpoint] <--> Serv
        Serv --> Ctrl[Simulation Controller]
    end
    
    subgraph Simulation & RL
        Ctrl <--> Env[Gymnasium Env]
        Env <--> SB3[PPO Agent / Policy]
        Env <--> TraCI[TraCI Client]
        TraCI <--> SUMO[SUMO Engine]
    end
```

## Features

- **Microscopic Traffic Simulation**: Uses SUMO to simulate realistic vehicles and multi-phase traffic intersections.
- **Gymnasium Environment Integration**: Custom reinforcement learning interface for traffic light phase control.
- **Pollution Dispersion & Emission Tracking**: Evaluates real-time CO2, NOx, and PM2.5 emissions based on vehicle fuel types and acceleration patterns.
- **Glassmorphic Web Dashboard**: Rich real-time analytical graphs, spatial intersection heatmaps, and what-if scenario testing inputs.
- **Pre-packaged Baselines**: Ready-to-evaluate baseline models (Fixed-time cycles and Actuated controllers) for comparative testing.

---

## Directory Structure

```
EcoTwin/
├── backend/            # FastAPI, Gymnasium Env, SUMO/TraCI controllers, emission calculators
├── simulation/         # Network files (.net.xml), routes, and config options for SUMO
├── frontend/           # Vite + React + TypeScript front-end application
├── data/               # Simulation data runs, emissions records, raw datasets
├── models/             # Reinforcement learning model checkpoints and baselines
├── notebooks/          # Step-by-step Jupyter notebooks for training & analysis
├── experiments/        # Training configurations & output results
├── outputs/            # Generated metrics, reports, and visualization charts
├── tests/              # Unit, integration, and API endpoint tests
└── scripts/            # Script hooks for running SUMO, training, and evaluations
```

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **SUMO (Simulation of Urban MObility)**: Ensure `SUMO_HOME` environment variable is pointing to your SUMO installation.

### Local Installation

1. **Clone the repository and install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and set the path to your `SUMO_HOME` folder.
   ```bash
   copy .env.example .env
   ```

### Execution

- **Start Backend server:**
  ```bash
  make run-backend
  ```
- **Start Frontend client:**
  ```bash
  make run-frontend
  ```
- **Train RL Agent:**
  ```bash
  make train
  ```
- **Evaluate Agent vs Baselines:**
  ```bash
  make evaluate
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
