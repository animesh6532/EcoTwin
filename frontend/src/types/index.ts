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

export interface SignalPhaseDetail {
  index: number;
  name: string;
  duration: number;
  state_pattern: string;
}

export interface DirectionApproachMetrics {
  direction: "North" | "South" | "East" | "West";
  incoming_lanes: string[];
  outgoing_lanes: string[];
  vehicles_approaching: number;
  vehicles_waiting: number;
  queue_length: number;
  average_speed: number;
  estimated_delay: number;
}

export interface SignalStateMap {
  north: "GREEN" | "YELLOW" | "RED";
  south: "GREEN" | "YELLOW" | "RED";
  east: "GREEN" | "YELLOW" | "RED";
  west: "GREEN" | "YELLOW" | "RED";
}

export interface TrafficLight {
  id: string;
  status: "ACTIVE" | "WARNING" | "CRITICAL" | "OFFLINE";
  active_phase: number;
  active_phase_name: string;
  phases: string[];
  phase_details: SignalPhaseDetail[];
  remaining_sec: number;
  elapsed_sec: number;
  next_phase: number;
  next_phase_name: string;
  cycle_duration: number;
  total_vehicles: number;
  total_queue: number;
  average_speed: number;
  average_delay: number;
  signal_state: SignalStateMap;
  approaches: DirectionApproachMetrics[];
  controller: string;
  timestamp: string;
}

export interface TrafficLightState {
  id: string;
  phase: number;
  phase_name?: string;
  remaining_sec?: number;
  signal_state?: SignalStateMap;
}

export interface TrafficLightActionResponse {
  success: boolean;
  junction_id: string;
  previous_phase: number;
  applied_phase: number;
  result: string;
  timestamp: string;
}

export interface TrafficOverrideLog {
  id: number;
  timestamp: string;
  session_id?: string | null;
  junction_id: string;
  previous_phase: number;
  new_phase: number;
  controller: string;
  duration_sec: number;
  result: string;
  user_source: string;
  error_message?: string | null;
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
  geocoding?: string;
  network?: string;
}

export interface SystemHealthResponse {
  status: string;
  components: SystemComponentStatus;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  locality: string | null;
  formattedAddress: string | null;
  permissionStatus: "granted" | "denied" | "prompt" | "unknown";
  source: "GPS" | "MANUAL" | "DEMO" | "UNRESOLVED";
  isDemoMode: boolean;
  loading: boolean;
  error: string | null;
  nearbyRoads: string[];
}

export interface ReverseGeocodeResult {
  city: string;
  state: string;
  country: string;
  locality: string;
  formatted_address: str | string;
  latitude: number;
  longitude: number;
  nearby_roads: string[];
}

export interface DataStatusMap {
  location: "GPS" | "MANUAL" | "DEMO" | "UNRESOLVED";
  traffic: "LIVE" | "ESTIMATED" | "SIMULATED" | "UNAVAILABLE";
  sumo: "RUNNING" | "PAUSED" | "OFFLINE";
  ml: "ACTIVE" | "READY" | "NOT ACTIVE";
  websocket: "CONNECTED" | "OFFLINE";
}

