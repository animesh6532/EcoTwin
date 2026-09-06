from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from backend.core.database import Base

class SimulationSession(Base):
    __tablename__ = "simulation_sessions"
    
    session_id = Column(String(36), primary_key=True, index=True)
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    scenario = Column(String(100), nullable=False)
    controller = Column(String(50), nullable=False) # e.g. "ppo" or "fixed_time"
    status = Column(String(20), default="running") # "running", "paused", "completed", "stopped"

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

class MetricSnapshot(Base):
    __tablename__ = "metric_snapshots"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey("simulation_sessions.session_id"), index=True, nullable=False)
    step = Column(Integer, nullable=False)
    simulation_time = Column(Float, nullable=False)
    vehicle_count = Column(Integer, nullable=False)
    average_speed = Column(Float, nullable=False)
    average_waiting_time = Column(Float, nullable=False)
    total_co2 = Column(Float, nullable=False)
    total_nox = Column(Float, nullable=False)
    total_fuel = Column(Float, nullable=False)
    reward = Column(Float, nullable=True)
    latency = Column(Float, nullable=True)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    training_date = Column(String(50), nullable=False)
    feature_version = Column(String(50), nullable=False)
    status = Column(String(20), default="active") # "active", "inactive"

class TrafficOverrideLog(Base):
    __tablename__ = "traffic_override_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)
    session_id = Column(String(36), nullable=True, index=True)
    junction_id = Column(String(50), nullable=False, index=True)
    previous_phase = Column(Integer, nullable=False)
    new_phase = Column(Integer, nullable=False)
    controller = Column(String(50), nullable=False)
    duration_sec = Column(Float, nullable=False, default=0.0)
    result = Column(String(20), nullable=False, default="SUCCESS")
    user_source = Column(String(50), nullable=False, default="MANUAL_OPERATOR")
    error_message = Column(Text, nullable=True)

