import { apiClient, handleApiError } from "./client";
import { MetricSnapshot } from "../types";

export async function getCurrentMetricsSnapshot(): Promise<MetricSnapshot> {
  try {
    const response = await apiClient.get<MetricSnapshot>("/metrics/current");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getHistoricalMetrics(sessionId: string): Promise<MetricSnapshot[]> {
  try {
    const response = await apiClient.get<MetricSnapshot[]>("/metrics/history", {
      params: { session_id: sessionId },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
