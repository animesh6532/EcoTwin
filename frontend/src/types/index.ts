// Strong TypeScript typings matching backend Pydantic schemas

export interface Vehicle {
  id: string;
  x: number;
  y: number;
  speed: number; // km/h
  waiting_time: number; // seconds
  co2: number; // mg/step
  nox: number; // mg/step
  fuel_consumption: number; // ml/step
  lane_id: string;
  road_id: string;
}

export interface VehicleSummary {
  total_vehicles: number;
  average_speed: number;
  average_waiting_time: number;
  total_co2: number;
  average_co2: number;
  total_nox: number;
  total_fuel: number;
}

export interface EmissionMetrics {
  co2: number;
  nox: number;
  fuel: number;
}

export interface PollutionCell {
  x: number;
  y: number;
  intensity: number;
  co2: number;
  vehicles: number;
}

export interface EmissionsResponse {
  current: EmissionMetrics;
  accumulated: EmissionMetrics;
  hotspots: string[];
}

export interface TrafficLight {
  id: string;
  active_phase: number;
  phases: string[];
}

export interface TrafficLightState {
  id: string;
  phase: number;
}

export interface TrafficLightActionResponse {
  success: boolean;
  applied_action: number;
}

export interface SimulationStatus {
  running: boolean;
  paused: boolean;
  simulation_time: number;
  vehicle_count: number;
  controller: string;
  session_id: string | null;
}

export interface SimulationSessionSchema {
  session_id: string;
  started_at: string;
  scenario: string;
  controller: string;
  status: string;
}

export interface SimulationConfig {
  scenario: string;
  gui: boolean;
  duration: number;
  step_length: number;
  controller: string;
}

export interface RLStatus {
  active_controller: string;
  model_version: string;
  mean_reward: number;
  latency_ms: number;
  running: boolean;
}

export interface RLConfig {
  controller_type: string;
  model_checkpoint?: string | null;
}

export interface ModelVersionSchema {
  name: string;
  version: string;
  training_date: string;
  feature_version: string;
  status: string;
}

export interface MetricSnapshot {
  id?: number;
  session_id: string;
  step: number;
  timestamp?: string;
  simulation_time: number;
  vehicle_count: number;
  average_speed: number;
  average_waiting_time: number;
  total_co2: number;
  total_nox: number;
  total_fuel: number;
  reward: number | null;
  latency?: number | null;
}

export interface ComparisonMetrics {
  metric: string;
  baseline: number;
  ppo: number;
  diff_absolute: number;
  improvement_pct: number;
}

export interface RunComparisonReport {
  session_ppo: string;
  session_baseline: string;
  duration_steps: number;
  metrics: ComparisonMetrics[];
}

export interface SystemComponentStatus {
  api: string;
  database: string;
  sumo: string;
  traci: string;
  ppo: string;
}

export interface SystemHealthResponse {
  status: string;
  components: SystemComponentStatus;
}
