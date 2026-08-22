import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10s timeout
});

export interface ApiError {
  message: string;
  statusCode?: number;
}

// Convert Axios errors to structured human-friendly formats
export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string | { msg: string }[] }>;
    const statusCode = axiosError.response?.status;
    const data = axiosError.response?.data;

    let message = "An unexpected error occurred. Please try again.";

    if (axiosError.code === "ECONNABORTED") {
      message = "The request timed out. Please check if the backend server is responsive.";
    } else if (!axiosError.response) {
      message = "Network error: Cannot reach the EcoTwin backend server.";
    } else if (data && data.detail) {
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Validation error format from FastAPI
        message = data.detail.map((err) => `${err.msg}`).join(", ");
      }
    } else if (statusCode === 400) {
      message = "Invalid request. Please check input parameters.";
    } else if (statusCode === 401) {
      message = "Unauthorized. Please authenticate.";
    } else if (statusCode === 403) {
      message = "Forbidden. Access is restricted.";
    } else if (statusCode === 404) {
      message = "Requested resource not found.";
    } else if (statusCode === 500) {
      message = "Internal server error occurred in the EcoTwin simulation backend.";
    }

    return { message, statusCode };
  }

  return { message: error instanceof Error ? error.message : String(error) };
}
