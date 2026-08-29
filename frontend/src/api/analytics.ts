import { apiClient, handleApiError } from "./client";
import { RunComparisonReport } from "../types";

export interface DemoComparisonResponse {
  ppo_run_id: string;
  baseline_run_id: string;
  status: string;
}

export async function compareRunsAnalysis(ppoSession: string, baselineSession: string): Promise<RunComparisonReport> {
  try {
    const response = await apiClient.get<RunComparisonReport>("/analysis/compare", {
      params: { ppo_session: ppoSession, baseline_session: baselineSession },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getDemoComparison(): Promise<DemoComparisonResponse> {
  try {
    const response = await apiClient.get<DemoComparisonResponse>("/analysis/demo-comparison");
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
