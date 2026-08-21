import { apiClient, handleApiError } from "./client";
import { EmissionMetrics, PollutionCell } from "../types";

export async function getCurrentEmissions(): Promise<EmissionMetrics> {
  try {
    const response = await apiClient.get<EmissionMetrics>("/emissions/current");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getAccumulatedEmissions(): Promise<EmissionMetrics> {
  try {
    const response = await apiClient.get<EmissionMetrics>("/emissions/history");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getEmissionHotspots(): Promise<string[]> {
  try {
    const response = await apiClient.get<string[]>("/emissions/hotspots");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getEmissionsSummary(): Promise<PollutionCell[]> {
  try {
    const response = await apiClient.get<PollutionCell[]>("/emissions/summary");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
