import { apiClient, handleApiError } from "./client";
import { RLStatus, RLConfig, ModelVersionSchema } from "../types";

export async function getRLStatus(): Promise<RLStatus> {
  try {
    const response = await apiClient.get<RLStatus>("/rl/status");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function setRLMode(config: RLConfig): Promise<RLStatus> {
  try {
    const response = await apiClient.post<RLStatus>("/rl/mode", config);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getRLModelInfo(): Promise<ModelVersionSchema> {
  try {
    const response = await apiClient.get<ModelVersionSchema>("/rl/model");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
