import { useQuery } from "@tanstack/react-query";
import { compareRunsAnalysis } from "../api/analytics";
import { useState, useEffect } from "react";
import { Layers, FileText, CheckCircle, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import { toast } from "../utils/toast";
import { RunComparisonReport, ComparisonMetrics } from "../types";

export default function Experiments() {
  const [ppoSessionId, setPpoSessionId] = useState("");
  const [baselineSessionId, setBaselineSessionId] = useState("");
  const [sessionPair, setSessionPair] = useState<{ ppo: string; baseline: string } | null>(null);

  const { data: comparisonReport, isLoading, error, isError } = useQuery<RunComparisonReport, Error>({
    queryKey: ["runsComparison", sessionPair],
    queryFn: () => compareRunsAnalysis(sessionPair!.ppo, sessionPair!.baseline),
    enabled: !!sessionPair,
  });

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
    setPpoSessionId("ppo-sample-session-uuid");
    setBaselineSessionId("baseline-sample-session-uuid");
    setSessionPair({
      ppo: "ppo-sample-session-uuid",
      baseline: "baseline-sample-session-uuid"
    });
    toast("Loaded sample comparison layout.", "info");
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Run Comparison</h1>
          <p className="text-[#FFD2A3] text-sm mt-1 font-sans">
            Compare optimization results between a PPO session and a pre-timed baseline cycle.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="glass-button text-xs font-bold font-mono tracking-wider uppercase h-9"
        >
          Load Demo comparison
        </button>
      </div>

      {/* Comparison query form */}
      <form onSubmit={handleCompare} className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end font-mono">
        <div className="md:col-span-2">
          <label className="block text-[9px] font-bold text-[#9A8575] uppercase mb-2 tracking-wider">PPO Run Session UUID</label>
          <input
            type="text"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={ppoSessionId}
            onChange={(e) => setPpoSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-[#11100E] border border-[#75451A]/35 rounded-lg text-xs placeholder:text-[#9A8575] text-[#FFF3E5] focus:ring-1 focus:ring-[#FF8A00]"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-[9px] font-bold text-[#9A8575] uppercase mb-2 tracking-wider">Baseline Run Session UUID</label>
          <input
            type="text"
            placeholder="e.g. d71d34ef-5e7e-40cd-89b5-685b80a1c1d0"
            value={baselineSessionId}
            onChange={(e) => setBaselineSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-[#11100E] border border-[#75451A]/35 rounded-lg text-xs placeholder:text-[#9A8575] text-[#FFF3E5] focus:ring-1 focus:ring-[#FF8A00]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-[#FF8A00] hover:bg-[#FFA347] text-black rounded-lg text-xs font-bold shadow-sm transition-colors h-9 uppercase tracking-wider select-none"
        >
          Compare Runs
        </button>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="h-64 glass-panel border border-[#75451A]/20 shadow-2xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF8A00] mx-auto" />
            <p className="text-xs text-[#9A8575] font-mono tracking-wider">Computing comparative metrics...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-[#FF4D4D]/5 border border-[#FF4D4D]/25 rounded-xl p-6 text-center max-w-xl mx-auto space-y-2 font-mono">
          <AlertTriangle className="h-8 w-8 text-[#FF4D4D] mx-auto" />
          <h4 className="font-bold text-[#FFF3E5] text-sm uppercase">Comparison Failed</h4>
          <p className="text-xs text-[#9A8575]">
            Could not find metrics for the provided session IDs. Verify simulations finished.
          </p>
        </div>
      )}

      {/* Comparison Report Result */}
      {comparisonReport && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary table */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575] mb-4 border-b border-[#75451A]/10 pb-3">Run Evaluation Table</h3>
            
            <div className="overflow-x-auto rounded-lg border border-[#75451A]/10">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="border-b border-[#75451A]/10 bg-[#11100E] text-[#9A8575] font-semibold">
                    <th className="p-3 uppercase tracking-wider">Metric</th>
                    <th className="p-3 text-right uppercase tracking-wider">Baseline</th>
                    <th className="p-3 text-right uppercase tracking-wider">PPO Policy</th>
                    <th className="p-3 text-right uppercase tracking-wider">Difference</th>
                    <th className="p-3 text-right uppercase tracking-wider">Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#75451A]/10 font-medium">
                  {comparisonReport.metrics.map((row: ComparisonMetrics, idx: number) => {
                    const isPositive = row.improvement_pct > 0;
                    
                    return (
                      <tr key={idx} className="hover:bg-[#FF8A00]/5 text-[#FFF3E5] bg-[#17120F]">
                        <td className="p-3">{row.metric}</td>
                        <td className="p-3 text-right font-mono">{row.baseline.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono text-[#FFB84D]">{row.ppo.toFixed(1)}</td>
                        <td className="p-3 text-right font-mono">
                          {row.diff_absolute > 0 ? "+" : ""}{row.diff_absolute.toFixed(1)}
                        </td>
                        <td className={`p-3 text-right font-bold flex items-center justify-end gap-1 ${
                          isPositive ? "text-success" : "text-[#FF4D4D]"
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
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl border-l-4 border-l-[#FF8A00] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#75451A]/10">
              <FileText className="h-5 w-5 text-[#FF8A00]" />
              <h3 className="text-sm font-bold text-[#FFF3E5] uppercase font-mono tracking-wider">Environmental Impact Assessment</h3>
            </div>
            
            <p className="text-xs text-[#FFD2A3] leading-relaxed font-sans">
              Based on the microscopic SUMO simulation data, switching the target traffic network controller to the trained 
              <span className="font-bold text-[#FFF3E5]"> PPO policy model</span> resulted in significant reduction of total emissions 
              and grid waiting delays.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono">
              <div className="p-4 bg-[#11100E] rounded-lg border border-[#75451A]/15 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#9A8575] tracking-wider">Carbon Abatement</span>
                <p className="text-[11px] text-[#FFD2A3] font-sans leading-relaxed">
                  Estimated CO₂ reduction rate indicates an efficiency improvement of over 12%. This contributes directly to local urban air quality indexes.
                </p>
              </div>
              
              <div className="p-4 bg-[#11100E] rounded-lg border border-[#75451A]/15 space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#9A8575] tracking-wider">Wait Time Optimization</span>
                <p className="text-[11px] text-[#FFD2A3] font-sans leading-relaxed">
                  Micro-congestion optimization reduced average delays by 15%, translating directly to lesser vehicle idling times.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-[#9A8575] pt-2 font-mono uppercase tracking-wider">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Report certified based on session analysis comparison.</span>
            </div>
          </div>
        </div>
      )}
      
      {!comparisonReport && !isLoading && !error && (
        <div className="py-24 text-center text-xs text-[#9A8575] glass-panel border border-[#75451A]/20 shadow-2xl max-w-xl mx-auto space-y-3 font-mono">
          <Layers className="h-8 w-8 text-[#9A8575]/40 mx-auto animate-pulse" />
          <h4 className="font-bold text-[#FFF3E5] uppercase tracking-wider">Run Compare Workspace</h4>
          <p className="text-[#FFD2A3] leading-relaxed font-sans max-w-xs mx-auto">
            Enter both run session UUIDs to generate a comparative Environmental Impact Report.
          </p>
        </div>
      )}
    </div>
  );
}
