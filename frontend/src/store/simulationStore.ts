import { create } from "zustand";
import { Vehicle, TrafficLight, PollutionCell, SimulationStatus } from "../types";

export interface SimulationState {
  // Connection state
  connectionState: "connecting" | "connected" | "disconnected" | "error";
  
  // Simulation control state
  running: boolean;
  paused: boolean;
  simulationTime: number;
  vehicleCount: number;
  controller: string; // "fixed_time" | "ppo"
  sessionId: string | null;

  // Live simulation data
  vehicles: Vehicle[];
  trafficLights: TrafficLight[];
  metrics: {
    vehicle_count: number;
    average_speed: number;
    average_waiting_time: number;
    total_co2: number;
  };
  pollution: PollutionCell[];

  // Selection states
  selectedVehicleId: string | null;
  selectedIntersectionId: string | null;

  // System status
  sumoStatus: "healthy" | "unavailable";
  traciStatus: "healthy" | "inactive";
  ppoStatus: "healthy" | "inactive";

  // Actions
  setConnectionState: (state: "connecting" | "connected" | "disconnected" | "error") => void;
  setSimulationStatus: (status: Partial<SimulationStatus>) => void;
  updateSimulationState: (payload: {
    simulation_time: number;
    vehicles: Vehicle[];
    traffic_lights: TrafficLight[];
    metrics: {
      vehicle_count: number;
      average_speed: number;
      average_waiting_time: number;
      total_co2: number;
    };
    pollution: PollutionCell[];
  }) => void;
  selectVehicle: (id: string | null) => void;
  selectIntersection: (id: string | null) => void;
  setSystemStatus: (statuses: { sumo: string; traci: string; ppo: string }) => void;
  resetState: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  connectionState: "disconnected",
  
  running: false,
  paused: false,
  simulationTime: 0,
  vehicleCount: 0,
  controller: "fixed_time",
  sessionId: null,

  vehicles: [],
  trafficLights: [],
  metrics: {
    vehicle_count: 0,
    average_speed: 0,
    average_waiting_time: 0,
    total_co2: 0,
  },
  pollution: [],

  selectedVehicleId: null,
  selectedIntersectionId: null,

  sumoStatus: "unavailable",
  traciStatus: "inactive",
  ppoStatus: "inactive",

  setConnectionState: (state) => set({ connectionState: state }),
  
  setSimulationStatus: (status) => set((state) => ({
    running: status.running !== undefined ? status.running : state.running,
    paused: status.paused !== undefined ? status.paused : state.paused,
    simulationTime: status.simulation_time !== undefined ? status.simulation_time : state.simulationTime,
    vehicleCount: status.vehicle_count !== undefined ? status.vehicle_count : state.vehicleCount,
    controller: status.controller !== undefined ? status.controller : state.controller,
    sessionId: status.session_id !== undefined ? status.session_id : state.sessionId,
  })),

  updateSimulationState: (payload) => set(() => ({
    simulationTime: payload.simulation_time,
    vehicles: payload.vehicles,
    trafficLights: payload.traffic_lights,
    vehicleCount: payload.vehicles.length,
    metrics: payload.metrics,
    pollution: payload.pollution,
  })),

  selectVehicle: (id) => set({ selectedVehicleId: id }),
  selectIntersection: (id) => set({ selectedIntersectionId: id }),

  setSystemStatus: (statuses) => set({
    sumoStatus: statuses.sumo === "healthy" ? "healthy" : "unavailable",
    traciStatus: statuses.traci === "healthy" ? "healthy" : "inactive",
    ppoStatus: statuses.ppo === "healthy" ? "healthy" : "inactive",
  }),

  resetState: () => set({
    vehicles: [],
    trafficLights: [],
    metrics: {
      vehicle_count: 0,
      average_speed: 0,
      average_waiting_time: 0,
      total_co2: 0,
    },
    pollution: [],
    selectedVehicleId: null,
    selectedIntersectionId: null,
  }),
}));
