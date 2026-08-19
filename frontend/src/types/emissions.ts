export interface EmissionMetric {
  co2: number;
  nox: number;
  pm25: number;
  fuel: number;
}

export interface EmissionsResponse {
  timestamp: number;
  step: number;
  total_emissions: EmissionMetric;
  lane_emissions: Record<string, EmissionMetric>;
  hotspots: string[];
}
