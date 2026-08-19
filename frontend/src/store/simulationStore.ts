import { useState, useEffect } from 'react';

export interface Vehicle {
  id: string;
  x: number;
  y: number;
  speed: number;
  lane: string;
  type: string;
  waiting_time: number;
}

export interface SignalState {
  id: string;
  phase: number;
  ryg_state: string;
  program: string;
  next_switch: number;
}

export interface SimulationState {
  status: 'stopped' | 'running';
  step: number;
  active_vehicles: number;
  vehicles: Vehicle[];
  signals: Record<string, SignalState>;
  emissions: {
    co2: number;
    nox: number;
    pm25: number;
    fuel: number;
  };
}

// Simple state listener store
type Listener = (state: SimulationState) => void;
let currentState: SimulationState = {
  status: 'stopped',
  step: 0,
  active_vehicles: 0,
  vehicles: [],
  signals: {},
  emissions: { co2: 0, nox: 0, pm25: 0, fuel: 0 }
};

let listeners: Listener[] = [];

export const simulationStore = {
  getState() {
    return currentState;
  },
  setState(nextState: Partial<SimulationState>) {
    currentState = { ...currentState, ...nextState };
    listeners.forEach(listener => listener(currentState));
  },
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};

export function useSimulationState() {
  const [state, setState] = useState<SimulationState>(currentState);
  
  useEffect(() => {
    return simulationStore.subscribe(setState);
  }, []);
  
  return state;
}
