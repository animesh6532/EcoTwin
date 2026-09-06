import { apiClient, handleApiError } from "./client";

export interface NetworkJunctionLocation {
  id: string;
  x: number;
  y: number;
}

export interface NetworkLocationResponse {
  network_id: string;
  projection: string;
  boundaries: {
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
  };
  center_lat: number;
  center_lng: number;
  junctions: NetworkJunctionLocation[];
}

export async function getNetworkLocation(): Promise<NetworkLocationResponse> {
  try {
    const response = await apiClient.get<NetworkLocationResponse>("/location/network");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
