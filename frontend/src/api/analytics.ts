import { apiClient, handleApiError } from "./client";
import { RunComparisonReport } from "../types";

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
