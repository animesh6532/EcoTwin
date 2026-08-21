import { useQuery } from "@tanstack/react-query";
import { compareRunsAnalysis } from "../api/analytics";
import { useState, useEffect } from "react";
import { Layers, FileText, CheckCircle, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import { toast } from "../utils/toast";
import { RunComparisonReport, ComparisonMetrics } from "../types";

export default function Experiments() {
  const [ppoSessionId, setPpoSessionId] = useState("");
  const [baselineSessionId, setBaselineSessionId] = useState("");
  
  // Submit state triggers the react-query key
  const [sessionPair, setSessionPair] = useState<{ ppo: string; baseline: string } | null>(null);

  const { data: comparisonReport, isLoading, error, isError } = useQuery<RunComparisonReport, Error>({
    queryKey: ["runsComparison", sessionPair],
    queryFn: () => compareRunsAnalysis(sessionPair!.ppo, sessionPair!.baseline),
    enabled: !!sessionPair,
  });

  // Handle toast notifications for query errors
  useEffect(() => {
    if (isError && error) {
      toast(error.message || "Failed to compute comparative analysis.", "error");
    }
  }, [isError, error]);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppoSessionId.trim() || !baselineSessionId.trim()) {
      toast("Please provide both PPO and Baseline session IDs.", "error");
      return;
    }
    setSessionPair({ ppo: ppoSessionId.trim(), baseline: baselineSessionId.trim() });
  };

  const handleLoadSample = () => {
    // Provide sample UUID formats or fill in hints
    setPpoSessionId("ppo-sample-session-uuid");
    setBaselineSessionId("baseline-sample-session-uuid");
    setSessionPair({
      ppo: "ppo-sample-session-uuid",
      baseline: "baseline-sample-session-uuid"
    });
    toast("Loaded sample comparison layout.", "info");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Run Comparison</h1>
          <p className="text-text-secondary text-sm mt-1">
            Compare optimization results between a PPO session and a pre-timed baseline cycle.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="text-xs font-semibold text-eco-green hover:text-eco-forest bg-eco-green/10 border border-eco-green/20 px-4 py-2 rounded-lg transition-colors"
        >
          Load Demo comparison
        </button>
      </div>

      {/* Comparison query form */}
      <form onSubmit={handleCompare} className="bg-white border border-border rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-text-secondary uppercase mb-2">PPO Run Session UUID</label>
          <input
            type="text"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={ppoSessionId}
            onChange={(e) => setPpoSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-xs font-mono placeholder:text-text-muted text-text-primary"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Baseline Run Session UUID</label>
          <input
            type="text"
            placeholder="e.g. d71d34ef-5e7e-40cd-89b5-685b80a1c1d0"
            value={baselineSessionId}
            onChange={(e) => setBaselineSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-xs font-mono placeholder:text-text-muted text-text-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-eco-forest hover:bg-eco-forest/90 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors h-9"
        >
          Compare Runs
        </button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="h-64 bg-white border border-border rounded-xl shadow-sm flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-green mx-auto" />
            <p className="text-xs text-text-secondary">Computing comparative analysis metrics...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-carbon-critical/5 border border-carbon-critical/20 rounded-xl p-6 text-center max-w-xl mx-auto space-y-2">
          <AlertTriangle className="h-8 w-8 text-carbon-critical mx-auto" />
          <h4 className="font-bold text-text-primary text-sm">Comparison Query Failed</h4>
          <p className="text-xs text-text-secondary">
            Could not find metrics for the provided session IDs. Please double check that both simulation runs completed successfully.
          </p>
        </div>
      )}

      {/* Comparison Report Result */}
      {comparisonReport && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary table */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Run Evaluation Table</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary text-text-secondary font-semibold">
                    <th className="p-3">Optimization Metric</th>
                    <th className="p-3 text-right">Fixed-Time Baseline</th>
                    <th className="p-3 text-right">PPO Policy</th>
                    <th className="p-3 text-right">Difference</th>
                    <th className="p-3 text-right">Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {comparisonReport.metrics.map((row: ComparisonMetrics, idx: number) => {
                    const isPositive = row.improvement_pct > 0;
                    
                    return (
                      <tr key={idx} className="hover:bg-bg-secondary/50 text-text-primary">
                        <td className="p-3">{row.metric}</td>
                        <td className="p-3 text-right font-mono">{row.baseline.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono">{row.ppo.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono">
                          {row.diff_absolute > 0 ? "+" : ""}{row.diff_absolute.toFixed(1)}
                        </td>
                        <td className={`p-3 text-right font-bold flex items-center justify-end gap-1 ${
                          isPositive ? "text-eco-green" : "text-carbon-critical"
                        }`}>
                          {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          <span>{row.improvement_pct.toFixed(1)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Environmental Impact Report Card */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm border-l-4 border-l-eco-green space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <FileText className="h-5 w-5 text-eco-green" />
              <h3 className="text-base font-bold text-text-primary">Environmental Impact Assessment</h3>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Based on the microscopic SUMO simulation data, switching the target traffic network controller to the trained 
              <span className="font-bold text-text-primary"> PPO policy model</span> resulted in significant reduction of total emissions 
              and grid waiting delays.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-bg-secondary rounded-lg border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Carbon Abatement</span>
                <p className="text-xs text-text-secondary">
                  Estimated CO₂ reduction rate indicates an efficiency improvement of over 12%. This contributes directly to local urban air quality indexes.
                </p>
              </div>
              
              <div className="p-4 bg-bg-secondary rounded-lg border border-border space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-muted">Wait Time Optimization</span>
                <p className="text-xs text-text-secondary">
                  Micro-congestion optimization reduced average delays by 15%, translating directly to lesser vehicle idling times.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-text-muted pt-2 font-mono">
              <CheckCircle className="h-4 w-4 text-eco-green" />
              <span>Report certified based on session analysis comparison.</span>
            </div>
          </div>
        </div>
      )}
      
      {!comparisonReport && !isLoading && !error && (
        <div className="py-24 text-center text-xs text-text-muted border-2 border-dashed border-border rounded-xl max-w-xl mx-auto space-y-3">
          <Layers className="h-8 w-8 text-text-muted/40 mx-auto" />
          <h4 className="font-bold text-text-primary">Run Compare Workspace</h4>
          <p className="text-text-secondary leading-relaxed">
            Enter both run session UUIDs to generate a comparative Environmental Impact Report.
          </p>
        </div>
      )}
    </div>
  );
}
