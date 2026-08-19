# EcoTwin System Architecture

This document describes the design layers of the EcoTwin platform.

```
       +---------------------------------------------+
       |           React Frontend Client             |
       +---------------------------------------------+
                              ^
                              | (HTTP / WebSockets)
                              v
       +---------------------------------------------+
       |              FastAPI Web Server             |
       |  - API Routers (Traffic, Emissions, Health) |
       |  - WebSocket Client Connection Manager      |
       +---------------------------------------------+
                              ^
                              | (Service Injection)
                              v
       +---------------------------------------------+
       |             Services & RL Agents            |
       |  - Simulation Service (Worker loops)        |
       |  - PPO Optimization Controller              |
       |  - Gymnasium Environment                    |
       +---------------------------------------------+
                              ^
                              | (TraCI Client Protocol)
                              v
       +---------------------------------------------+
       |          SUMO (Traffic Simulation Engine)   |
       +---------------------------------------------+
```

## Layers
1. **Frontend**: Vite + React + TypeScript web application serving glassmorphic analytical graphs and live vehicle coordinate projection mappings.
2. **Backend Services**: FastAPI endpoints managing controller configurations and running background simulation loops.
3. **Simulation Client**: Safe TraCI client managing process threads and mapping observations.
