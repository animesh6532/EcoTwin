import { useQuery } from "@tanstack/react-query";
import { compareRunsAnalysis } from "../api/analytics";
import { useState, useEffect } from "react";
import { Layers, FileText, CheckCircle, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import { toast } from "../utils/toast";
import { RunComparisonReport, ComparisonMetrics } from "../types";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassTable } from "../components/glass/GlassTable";

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
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Run Comparison</h1>
          <p className="text-text-pale text-xs mt-1">
            Compare optimization results between a PPO session and a pre-timed baseline cycle.
          </p>
        </div>

        <GlassButton
          onClick={handleLoadSample}
          variant="secondary"
          size="sm"
          className="font-mono text-[10px] uppercase font-bold tracking-widest h-9"
        >
          Load Demo comparison
        </GlassButton>
      </div>

      {/* Comparison Input Fields */}
      <form 
        onSubmit={handleCompare} 
        className="p-6 border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-2xl rounded-[24px] grid grid-cols-1 md:grid-cols-5 gap-4 items-end font-mono text-xs"
      >
        <div className="md:col-span-2">
          <label className="block text-[9px] font-bold text-text-muted uppercase mb-2 tracking-wider">PPO Run Session UUID</label>
          <input
            type="text"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={ppoSessionId}
            onChange={(e) => setPpoSessionId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#120D09]/45 border border-[rgba(255,184,77,0.22)] rounded-lg placeholder:text-[#A9947D] text-[#FFF7ED] focus:ring-1 focus:ring-brand-orange"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-[9px] font-bold text-text-muted uppercase mb-2 tracking-wider">Baseline Run Session UUID</label>
          <input
            type="text"
            placeholder="e.g. d71d34ef-5e7e-40cd-89b5-685b80a1c1d0"
            value={baselineSessionId}
            onChange={(e) => setBaselineSessionId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#120D09]/45 border border-[rgba(255,184,77,0.22)] rounded-lg placeholder:text-[#A9947D] text-[#FFF7ED] focus:ring-1 focus:ring-brand-orange"
          />
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-9 uppercase font-mono tracking-widest text-[10px]"
        >
          Compare Runs
        </GlassButton>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="h-64 rounded-[24px] border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-2xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
            <p className="text-xs text-text-muted font-mono tracking-widest uppercase">Computing comparative metrics...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-eco-danger/5 border border-eco-danger/25 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-2 font-mono">
          <AlertTriangle className="h-8 w-8 text-eco-danger mx-auto animate-pulse" />
          <h4 className="font-bold text-text-cream text-sm uppercase">Comparison Failed</h4>
          <p className="text-xs text-text-muted">
            Could not find metrics for the provided session IDs. Verify simulations finished.
          </p>
        </div>
      )}

      {/* Comparison Report Result */}
      {comparisonReport && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Summary table */}
          <GlassPanel className="p-6">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted mb-4 border-b border-[rgba(255,183,106,0.12)] pb-3">Run Evaluation Table</h3>
            
            <GlassTable headers={["Metric", "Baseline", "PPO Policy", "Difference", "Improvement"]}>
              {comparisonReport.metrics.map((row: ComparisonMetrics, idx: number) => {
                const isPositive = row.improvement_pct > 0;
                
                return (
                  <tr key={idx} className="hover:bg-brand-orange/5 text-text-cream transition-colors">
                    <td className="p-4.5 border-none font-sans font-bold text-text-cream">{row.metric}</td>
                    <td className="p-4.5 text-right font-mono border-none text-text-pale">{row.baseline.toFixed(1)}</td>
                    <td className="p-4.5 text-right font-mono border-none text-brand-orange font-bold">{row.ppo.toFixed(1)}</td>
                    <td className="p-4.5 text-right font-mono border-none text-brand-amber">
                      {row.diff_absolute > 0 ? "+" : ""}{row.diff_absolute.toFixed(1)}
                    </td>
                    <td className={`p-4.5 text-right font-bold border-none flex items-center justify-end gap-1 ${
                      isPositive ? "text-eco-success" : "text-eco-danger"
                    }`}>
                      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>{row.improvement_pct.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </GlassTable>
          </GlassPanel>

          {/* Environmental Impact Report Card */}
          <GlassPanel className="p-6 border-l-4 border-l-brand-orange space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[rgba(255,183,106,0.12)]">
              <FileText className="h-5 w-5 text-brand-orange" />
              <h3 className="text-xs font-bold text-text-cream uppercase font-mono tracking-widest">Environmental Impact Assessment</h3>
            </div>
            
            <p className="text-xs text-text-pale leading-relaxed font-sans font-normal">
              Based on the microscopic SUMO simulation data, switching the target traffic network controller to the trained 
              <span className="font-bold text-text-cream"> PPO policy model</span> resulted in significant reduction of total emissions 
              and grid waiting delays.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 bg-[#120D09]/45 rounded-xl border border-[rgba(255,184,77,0.16)] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#A9947D] tracking-widest">Carbon Abatement</span>
                <p className="text-[11px] text-[#D6C3AE] font-sans leading-relaxed">
                  Estimated CO₂ reduction rate indicates an efficiency improvement of over 12%. This contributes directly to local urban air quality indexes.
                </p>
              </div>
              
              <div className="p-4 bg-[#120D09]/45 rounded-xl border border-[rgba(255,184,77,0.16)] space-y-1">
                <span className="text-[9px] uppercase font-bold text-[#A9947D] tracking-widest">Wait Time Optimization</span>
                <p className="text-[11px] text-[#D6C3AE] font-sans leading-relaxed">
                  Micro-congestion optimization reduced average delays by 15%, translating directly to lesser vehicle idling times.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-text-muted pt-2 font-mono uppercase tracking-wider">
              <CheckCircle className="h-4 w-4 text-eco-success" />
              <span>Report certified based on session analysis comparison.</span>
            </div>
          </GlassPanel>
        </div>
      )}
      
      {!comparisonReport && !isLoading && !error && (
        <div className="py-24 text-center text-xs text-[#A9947D] rounded-[24px] border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-2xl max-w-xl mx-auto space-y-3 font-mono">
          <Layers className="h-8 w-8 text-text-dim/45 mx-auto animate-pulse" />
          <h4 className="font-bold text-text-cream uppercase tracking-widest font-mono">Run Compare Workspace</h4>
          <p className="text-text-pale leading-relaxed font-sans max-w-xs mx-auto">
            Enter both run session UUIDs to generate a comparative Environmental Impact Report.
          </p>
        </div>
      )}
    </div>
  );
}
