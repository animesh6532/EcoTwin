import { apiClient, handleApiError } from "./client";
import { Vehicle, VehicleSummary } from "../types";

export async function getVehicles(limit = 100, offset = 0): Promise<Vehicle[]> {
  try {
    const response = await apiClient.get<Vehicle[]>("/vehicles", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getVehiclesSummary(): Promise<VehicleSummary> {
  try {
    const response = await apiClient.get<VehicleSummary>("/vehicles/summary");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getVehicleById(vehicleId: string): Promise<Vehicle> {
  try {
    const response = await apiClient.get<Vehicle>(`/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
