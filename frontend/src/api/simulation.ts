import { apiClient, handleApiError } from "./client";
import { SimulationStatus, SimulationConfig } from "../types";

export async function startSimulation(config: SimulationConfig): Promise<SimulationStatus> {
  try {
    const response = await apiClient.post<SimulationStatus>("/simulation/start", config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function pauseSimulation(): Promise<SimulationStatus> {
  try {
    const response = await apiClient.post<SimulationStatus>("/simulation/pause");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function resumeSimulation(): Promise<SimulationStatus> {
  try {
    const response = await apiClient.post<SimulationStatus>("/simulation/resume");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function stepSimulation(): Promise<SimulationStatus> {
  try {
    const response = await apiClient.post<SimulationStatus>("/simulation/step");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function stopSimulation(): Promise<SimulationStatus> {
  try {
    const response = await apiClient.post<SimulationStatus>("/simulation/stop");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getSimulationStatus(): Promise<SimulationStatus> {
  try {
    // Modify URL slightly if status is directly in /simulation/status
    const response = await apiClient.get<SimulationStatus>("/simulation/status");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
