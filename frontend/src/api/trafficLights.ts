import { apiClient, handleApiError } from "./client";
import { TrafficLight, TrafficLightState, TrafficLightActionResponse } from "../types";

export async function getTrafficLights(): Promise<string[]> {
  try {
    const response = await apiClient.get<string[]>("/traffic-lights");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getTrafficLightDetail(id: string): Promise<TrafficLight> {
  try {
    const response = await apiClient.get<TrafficLight>(`/traffic-lights/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getTrafficLightState(id: string): Promise<TrafficLightState> {
  try {
    const response = await apiClient.get<TrafficLightState>(`/traffic-lights/${id}/state`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function setTrafficLightAction(id: string, action: number, durationSec: number = 30): Promise<TrafficLightActionResponse> {
  try {
    const response = await apiClient.post<TrafficLightActionResponse>(`/traffic-lights/${id}/action`, null, {
      params: { action, duration_sec: durationSec }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getOverrideHistory(limit: number = 20): Promise<any[]> {
  try {
    const response = await apiClient.get<any[]>("/traffic-lights/overrides/history", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

