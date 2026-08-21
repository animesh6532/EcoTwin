from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

# Vehicle Schema
class Vehicle(BaseModel):
    id: str
    x: float
    y: float
    speed: float # km/h
    waiting_time: float # seconds
    co2: float # mg/step
    nox: float # mg/step
    fuel_consumption: float # ml/step
    lane_id: str
    road_id: str

class VehicleSummary(BaseModel):
    total_vehicles: int
    average_speed: float
    average_waiting_time: float
    total_co2: float
    average_co2: float
    total_nox: float
    total_fuel: float

# Emissions Schemas
class EmissionMetrics(BaseModel):
    co2: float # mg/s or total raw emissions
    nox: float
    fuel: float

class PollutionCell(BaseModel):
    x: float
    y: float
    intensity: float
    co2: float
    vehicles: int

class EmissionsResponse(BaseModel):
    current: EmissionMetrics
    accumulated: EmissionMetrics
    hotspots: List[str]

# Traffic Lights Schemas
class TrafficLight(BaseModel):
    id: str
    active_phase: int
    phases: List[str]

# Simulation Status Schemas
class SimulationStatus(BaseModel):
    running: bool
    paused: bool
    simulation_time: float
    vehicle_count: int
    controller: str
    session_id: Optional[str] = None

class SimulationSessionSchema(BaseModel):
    session_id: str
    started_at: datetime
    scenario: str
    controller: str
    status: str

class SimulationConfig(BaseModel):
    scenario: str = Field(default="normal", description="Scenario configuration name")
    gui: bool = Field(default=False, description="Run SUMO with GUI")
    duration: int = Field(default=3600, description="Max simulation steps")
    step_length: float = Field(default=0.1, description="Step length in seconds")
    controller: str = Field(default="fixed_time", description="Initial controller: fixed_time or ppo")

# RL Service Status Schemas
class RLStatus(BaseModel):
    active_controller: str
    model_version: str
    mean_reward: float
    latency_ms: float
    running: bool

class RLConfig(BaseModel):
    controller_type: str = Field(default="ppo", description="Option: fixed_time, ppo")
    model_checkpoint: Optional[str] = Field(default=None, description="Target checkpoint path")

class ModelVersionSchema(BaseModel):
    name: str
    version: str
    training_date: str
    feature_version: str
    status: str
