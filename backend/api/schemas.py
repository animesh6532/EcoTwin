from pydantic import BaseModel, Field
from typing import List, Dict, Optional

# Health Schema
class HealthResponse(BaseModel):
    status: str
    sumo_home: str
    sumo_installed: bool
    version: str

# Simulation Schemas
class SimulationConfig(BaseModel):
    scenario: str = Field(default="normal", description="Scenario configuration name (e.g. normal, rush_hour)")
    gui: bool = Field(default=True, description="Run SUMO with GUI graphical visualization")
    duration: int = Field(default=3600, description="Duration in simulation seconds")
    step_length: float = Field(default=0.1, description="Length of simulation steps in seconds")

class SimulationStateResponse(BaseModel):
    status: str
    step: int
    active_vehicles: int
    completed_vehicles: int
    running: bool

# Traffic Schemas
class IntersectionMetric(BaseModel):
    intersection_id: str
    phase: int
    phase_name: str
    queue_length: float
    average_delay: float
    total_waiting_time: float

class TrafficMetricsResponse(BaseModel):
    timestamp: float
    step: int
    average_speed: float
    active_vehicles: int
    intersections: List[IntersectionMetric]

# Emissions Schemas
class EmissionMetric(BaseModel):
    co2: float  # mg/s
    nox: float  # mg/s
    pm25: float  # mg/s
    fuel: float  # ml/s

class EmissionsResponse(BaseModel):
    timestamp: float
    step: int
    total_emissions: EmissionMetric
    lane_emissions: Dict[str, EmissionMetric]
    hotspots: List[str]  # Lane IDs with emissions exceeding thresholds

# Optimization Schemas
class OptimizationConfig(BaseModel):
    controller_type: str = Field(default="rl", description="Options: fixed, actuated, rl")
    model_checkpoint: Optional[str] = Field(default=None, description="Path or tag of target policy")

class OptimizationStatusResponse(BaseModel):
    active_controller: str
    learning_rate: float
    episodes_completed: int
    mean_reward: float
    running: bool
