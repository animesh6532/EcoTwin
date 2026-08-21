import { apiClient, handleApiError } from "./client";
import { SystemHealthResponse } from "../types";

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  try {
    const response = await apiClient.get<SystemHealthResponse>("/health");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getSystemReadiness(): Promise<{ status: string }> {
  try {
    const response = await apiClient.get<{ status: string }>("/ready");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
