export interface SimulationConfig {
  scenario: string;
  gui: boolean;
  duration: number;
  step_length: number;
}

export interface SignalState {
  id: string;
  phase: number;
  ryg_state: string;
  program: string;
  next_switch: number;
}
