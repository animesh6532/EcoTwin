import { apiClient, handleApiError } from "./client";
import { ReverseGeocodeResult } from "../types";

export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
  try {
    const response = await apiClient.post<ReverseGeocodeResult>("/location/reverse-geocode", {
      latitude,
      longitude
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function resolveLocation(query: string): Promise<ReverseGeocodeResult> {
  try {
    const response = await apiClient.post<ReverseGeocodeResult>("/location/resolve", {
      query
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
