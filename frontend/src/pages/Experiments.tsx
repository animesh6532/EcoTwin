import { useQuery } from "@tanstack/react-query";
import { compareRunsAnalysis, getDemoComparison } from "../api/analytics";
import { getSimulationSessions } from "../api/simulation";
import { getHistoricalMetrics } from "../api/metrics";
import { useState, useEffect } from "react";
import {
  Layers,
  FileText,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Activity,
  Cpu,
  RefreshCw,
  Gauge,
  Clock,
  Flame,
  Wind,
  Info
} from "lucide-react";
import { toast } from "../utils/toast";
import { RunComparisonReport, ComparisonMetrics } from "../types";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassTable } from "../components/glass/GlassTable";
import { GlassChart } from "../components/glass/GlassChart";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

export default function Experiments() {
  const [ppoSessionId, setPpoSessionId] = useState("");
  const [baselineSessionId, setBaselineSessionId] = useState("");
  const [sessionPair, setSessionPair] = useState<{ ppo: string; baseline: string } | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // 1. Fetch completed runs for selectors
  const { data: ppoSessions, isLoading: isLoadingPpos } = useQuery({
    queryKey: ["ppoCompletedSessions"],
    queryFn: () => getSimulationSessions({ controller: "ppo", status: "completed" }),
  });

  const { data: baselineSessions, isLoading: isLoadingBaselines } = useQuery({
    queryKey: ["baselineCompletedSessions"],
    queryFn: () => getSimulationSessions({ controller: "fixed_time", status: "completed" }),
  });

  // 2. Fetch Comparison Report
  const {
    data: comparisonReport,
    isLoading: isLoadingComparison,
    error: comparisonError,
    isError: isComparisonError
  } = useQuery<RunComparisonReport, Error>({
    queryKey: ["runsComparison", sessionPair],
    queryFn: () => compareRunsAnalysis(sessionPair!.ppo, sessionPair!.baseline),
    enabled: !!sessionPair,
    retry: false,
  });

  // 3. Fetch Historical Telemetry for curves
  const { data: ppoHistory, isLoading: isLoadingPpoHistory } = useQuery({
    queryKey: ["ppoHistory", sessionPair?.ppo],
    queryFn: () => getHistoricalMetrics(sessionPair!.ppo),
    enabled: !!sessionPair && !isComparisonError,
  });

  const { data: baselineHistory, isLoading: isLoadingBaseHistory } = useQuery({
    queryKey: ["baselineHistory", sessionPair?.baseline],
    queryFn: () => getHistoricalMetrics(sessionPair!.baseline),
    enabled: !!sessionPair && !isComparisonError,
  });

  // Handle comparison error toasts
  useEffect(() => {
    if (isComparisonError && comparisonError) {
      toast(comparisonError.message || "Failed to compute comparative analysis.", "error");
    }
  }, [isComparisonError, comparisonError]);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppoSessionId.trim() || !baselineSessionId.trim()) {
      toast("Please select or enter both PPO and Baseline session IDs.", "error");
      return;
    }
    setSessionPair({ ppo: ppoSessionId.trim(), baseline: baselineSessionId.trim() });
    setDemoLoaded(false);
  };

  const handleLoadSample = async () => {
    try {
      const demo = await getDemoComparison();
      setPpoSessionId(demo.ppo_run_id);
      setBaselineSessionId(demo.baseline_run_id);
      setSessionPair({
        ppo: demo.ppo_run_id,
        baseline: demo.baseline_run_id
      });
      setDemoLoaded(true);
      toast("Seeded demo comparison runs loaded.", "success");
    } catch (err: any) {
      toast(err.message || "Failed to load demo comparison runs.", "error");
    }
  };

  // Align telemetry arrays for charting
  const getAlignedChartData = () => {
    if (!ppoHistory || !baselineHistory) return [];
    const baseMap = new Map(baselineHistory.map((h) => [h.step, h]));
    const aligned: any[] = [];

    ppoHistory.forEach((ppoPoint) => {
      const basePoint = baseMap.get(ppoPoint.step);
      if (basePoint) {
        aligned.push({
          step: ppoPoint.step,
          stepLabel: `S${ppoPoint.step}`,
          // CO2 in grams (converted from mg)
          co2_ppo: ppoPoint.total_co2 / 1000,
          co2_baseline: basePoint.total_co2 / 1000,
          // NOx in grams (converted from mg)
          nox_ppo: ppoPoint.total_nox / 1000,
          nox_baseline: basePoint.total_nox / 1000,
          // Waiting time in seconds
          wait_ppo: ppoPoint.average_waiting_time,
          wait_baseline: basePoint.average_waiting_time,
          // Speed in km/h
          speed_ppo: ppoPoint.average_speed,
          speed_baseline: basePoint.average_speed,
        });
      }
    });
    return aligned;
  };

  const chartData = getAlignedChartData();

  // Find metrics for display cards
  const co2Metric = comparisonReport?.metrics.find((m) => m.metric.toLowerCase().includes("co2"));
  const noxMetric = comparisonReport?.metrics.find((m) => m.metric.toLowerCase().includes("nox"));
  const waitMetric = comparisonReport?.metrics.find((m) => m.metric.toLowerCase().includes("waiting"));
  const speedMetric = comparisonReport?.metrics.find((m) => m.metric.toLowerCase().includes("speed"));
  const fuelMetric = comparisonReport?.metrics.find((m) => m.metric.toLowerCase().includes("fuel"));

  // Determine overall impact assessment
  let overallImpact = "SIMILAR";
  let overallImpactColor = "text-[#FFB84D] bg-[#FFB84D]/10 border-[#FFB84D]/20";
  let overallImpactExplanation = "Simulation metrics are similar under both controllers.";

  if (co2Metric && waitMetric) {
    const co2Imp = co2Metric.improvement_pct;
    const waitImp = waitMetric.improvement_pct;
    if (co2Imp >= 5 && waitImp >= 5) {
      overallImpact = "BETTER";
      overallImpactColor = "text-[#39D98A] bg-[#39D98A]/10 border-[#39D98A]/20 shadow-[0_0_15px_rgba(57,217,138,0.15)]";
      overallImpactExplanation = "PPO control reduced total carbon footprint and wait times compared with fixed-time baseline under equivalent scenario conditions.";
    } else if (co2Imp <= -5 || waitImp <= -5) {
      overallImpact = "WORSE";
      overallImpactColor = "text-[#FF4D4D] bg-[#FF4D4D]/10 border-[#FF4D4D]/20 shadow-[0_0_15px_rgba(255,77,77,0.15)]";
      overallImpactExplanation = "Fixed-time baseline cycle outperformed PPO optimization under these simulation parameters.";
    }
  }

  // Loading flag for comparison computations or histories
  const isLoadingData = isLoadingComparison || isLoadingPpoHistory || isLoadingBaseHistory;

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Run Comparison</h1>
          <p className="text-text-pale text-xs mt-1 font-sans">
            Compare optimization results between a PPO session and a pre-timed baseline cycle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setManualEntry(!manualEntry)}
            className="px-3.5 py-1.5 bg-[#120D09]/45 hover:bg-[#FF8A00]/10 border border-[rgba(255,184,77,0.22)] rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all text-[#FFF7ED] font-mono"
          >
            {manualEntry ? "Use Selectors" : "Enter UUIDs Manually"}
          </button>

          <GlassButton
            onClick={handleLoadSample}
            variant="secondary"
            size="sm"
            className="font-mono text-[10px] uppercase font-bold tracking-widest h-9"
          >
            Load Demo comparison
          </GlassButton>
        </div>
      </div>

      {/* Demo loaded banner */}
      {demoLoaded && (
        <div className="p-3.5 bg-[#39D98A]/5 border border-[#39D98A]/20 rounded-xl flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-[#39D98A] shadow-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <div className="flex flex-wrap gap-x-4">
            <span>✓ Demo PPO run loaded</span>
            <span>✓ Demo baseline run loaded</span>
          </div>
        </div>
      )}

      {/* Comparison Input Fields */}
      <form
        onSubmit={handleCompare}
        className="p-6 border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-2xl rounded-[24px] grid grid-cols-1 md:grid-cols-5 gap-5 items-end font-mono text-xs"
      >
        <div className="md:col-span-2">
          <label className="block text-[9px] font-bold text-text-muted uppercase mb-2 tracking-wider">
            PPO Run Session
          </label>
          {manualEntry ? (
            <input
              type="text"
              placeholder="Enter PPO Run UUID..."
              value={ppoSessionId}
              onChange={(e) => setPpoSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#120D09]/45 border border-[rgba(255,184,77,0.22)] rounded-lg placeholder:text-[#A9947D] text-[#FFF7ED] focus:ring-1 focus:ring-brand-orange"
            />
          ) : (
            <select
              value={ppoSessionId}
              onChange={(e) => setPpoSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#120D09]/85 border border-[rgba(255,184,77,0.22)] rounded-lg text-[#FFF7ED] focus:ring-1 focus:ring-brand-orange font-mono cursor-pointer"
            >
              <option value="" disabled>-- Select completed PPO run --</option>
              {ppoSessions?.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.scenario.toUpperCase()} | {new Date(s.started_at).toLocaleDateString()} | {s.session_id.substring(0, 8)}...
                </option>
              ))}
              {isLoadingPpos && <option disabled>Loading sessions...</option>}
            </select>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-[9px] font-bold text-text-muted uppercase mb-2 tracking-wider">
            Baseline Run Session
          </label>
          {manualEntry ? (
            <input
              type="text"
              placeholder="Enter Baseline Run UUID..."
              value={baselineSessionId}
              onChange={(e) => setBaselineSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#120D09]/45 border border-[rgba(255,184,77,0.22)] rounded-lg placeholder:text-[#A9947D] text-[#FFF7ED] focus:ring-1 focus:ring-brand-orange"
            />
          ) : (
            <select
              value={baselineSessionId}
              onChange={(e) => setBaselineSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#120D09]/85 border border-[rgba(255,184,77,0.22)] rounded-lg text-[#FFF7ED] focus:ring-1 focus:ring-brand-orange font-mono cursor-pointer"
            >
              <option value="" disabled>-- Select completed baseline --</option>
              {baselineSessions?.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.scenario.toUpperCase()} | {new Date(s.started_at).toLocaleDateString()} | {s.session_id.substring(0, 8)}...
                </option>
              ))}
              {isLoadingBaselines && <option disabled>Loading sessions...</option>}
            </select>
          )}
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-10 uppercase font-mono tracking-widest text-[10px] flex items-center justify-center gap-1.5"
          disabled={isLoadingData}
        >
          {isLoadingData ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Comparing...</span>
            </>
          ) : (
            <>
              <Activity className="h-3.5 w-3.5" />
              <span>Compare Runs</span>
            </>
          )}
        </GlassButton>
      </form>

      {/* Loading state */}
      {isLoadingData && (
        <div className="h-96 rounded-[24px] border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-2xl flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-orange mx-auto" />
            <p className="text-xs text-text-cream font-mono tracking-widest uppercase">
              {isLoadingComparison ? "Comparing simulation results..." : "Loading run metrics..."}
            </p>
            <p className="text-[10px] text-text-muted font-sans normal-case">
              Retrieving database logs and computing derived efficiency metrics...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isComparisonError && comparisonError && (
        <div className="bg-eco-danger/5 border border-eco-danger/25 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-3 font-mono">
          <AlertTriangle className="h-10 w-10 text-eco-danger mx-auto animate-pulse" />
          <h4 className="font-bold text-text-cream text-sm uppercase">Comparison Failed</h4>
          <p className="text-xs text-text-pale leading-relaxed">
            {comparisonError.message || "An error occurred while comparing simulation sessions."}
          </p>
          <div className="text-[9px] text-text-muted mt-2 border-t border-white/5 pt-2 text-left space-y-1">
            <div>Possible solutions:</div>
            <div>• Verify both simulation runs finished completely in the Operations workspace.</div>
            <div>• Confirm both run UUIDs exist in your active session registry database.</div>
            <div>• Make sure both compared runs use the exact same scenario.</div>
          </div>
        </div>
      )}

      {/* Comparison Report Result */}
      {comparisonReport && !isLoadingData && !isComparisonError && (
        <div className="space-y-8 animate-fade-in">
          {/* Environmental Impact Summary */}
          <GlassPanel className="p-6 border-l-4 border-l-brand-orange grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-brand-orange" />
                <span className="text-[10px] font-bold text-text-muted uppercase font-mono tracking-widest">
                  Environmental Impact Assessment
                </span>
              </div>
              <h2 className="text-sm font-bold text-text-cream font-sans">
                {overallImpactExplanation}
              </h2>
              <p className="text-[11px] text-[#A89582] font-mono leading-relaxed normal-case">
                PPO controller compared against Fixed-time baseline under equivalent traffic demand, scenario layout, and simulation steps ({comparisonReport.duration_steps} steps).
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end justify-center">
              <span className="text-[8px] font-mono font-bold text-[#A89582] uppercase tracking-wider mb-1.5">
                OVERALL IMPACT
              </span>
              <div
                className={`px-5 py-2.5 rounded-xl border text-xs font-black font-mono tracking-widest ${overallImpactColor}`}
              >
                {overallImpact}
              </div>
            </div>
          </GlassPanel>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* CO2 Card */}
            {co2Metric && (
              <div className="p-5 border rounded-2xl bg-[#080706]/58 border-[rgba(255,145,40,0.16)] flex flex-col justify-between h-40 font-mono text-xs shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-[#9D8C7B] tracking-wider">CO₂ Emissions</span>
                  <Flame className="h-4 w-4 text-brand-orange" />
                </div>
                <div className="space-y-1 my-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">Base:</span>
                    <span className="font-bold">{(co2Metric.baseline / 1000000).toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">PPO:</span>
                    <span className="font-bold text-brand-orange">{(co2Metric.ppo / 1000000).toFixed(2)} kg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[8px] text-[#9D8C7B]">IMPROVEMENT</span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${
                      co2Metric.improvement_pct > 0 ? "text-eco-success" : "text-eco-danger"
                    }`}
                  >
                    {co2Metric.improvement_pct > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    <span>{co2Metric.improvement_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* NOx Card */}
            {noxMetric && (
              <div className="p-5 border rounded-2xl bg-[#080706]/58 border-[rgba(255,145,40,0.16)] flex flex-col justify-between h-40 font-mono text-xs shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-[#9D8C7B] tracking-wider">NOx Emissions</span>
                  <Wind className="h-4 w-4 text-brand-orange" />
                </div>
                <div className="space-y-1 my-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">Base:</span>
                    <span className="font-bold">{(noxMetric.baseline / 1000).toFixed(2)} g</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">PPO:</span>
                    <span className="font-bold text-brand-orange">{(noxMetric.ppo / 1000).toFixed(2)} g</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[8px] text-[#9D8C7B]">IMPROVEMENT</span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${
                      noxMetric.improvement_pct > 0 ? "text-eco-success" : "text-eco-danger"
                    }`}
                  >
                    {noxMetric.improvement_pct > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    <span>{noxMetric.improvement_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fuel Card */}
            {fuelMetric && (
              <div className="p-5 border rounded-2xl bg-[#080706]/58 border-[rgba(255,145,40,0.16)] flex flex-col justify-between h-40 font-mono text-xs shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-[#9D8C7B] tracking-wider">Fuel Burned</span>
                  <Activity className="h-4 w-4 text-brand-orange" />
                </div>
                <div className="space-y-1 my-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">Base:</span>
                    <span className="font-bold">{(fuelMetric.baseline / 1000).toFixed(1)} L</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">PPO:</span>
                    <span className="font-bold text-brand-orange">{(fuelMetric.ppo / 1000).toFixed(1)} L</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[8px] text-[#9D8C7B]">IMPROVEMENT</span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${
                      fuelMetric.improvement_pct > 0 ? "text-eco-success" : "text-eco-danger"
                    }`}
                  >
                    {fuelMetric.improvement_pct > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    <span>{fuelMetric.improvement_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Waiting Time Card */}
            {waitMetric && (
              <div className="p-5 border rounded-2xl bg-[#080706]/58 border-[rgba(255,145,40,0.16)] flex flex-col justify-between h-40 font-mono text-xs shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-[#9D8C7B] tracking-wider">Wait Time</span>
                  <Clock className="h-4 w-4 text-brand-orange" />
                </div>
                <div className="space-y-1 my-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">Base:</span>
                    <span className="font-bold">{waitMetric.baseline.toFixed(1)} s</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">PPO:</span>
                    <span className="font-bold text-brand-orange">{waitMetric.ppo.toFixed(1)} s</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[8px] text-[#9D8C7B]">IMPROVEMENT</span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${
                      waitMetric.improvement_pct > 0 ? "text-eco-success" : "text-eco-danger"
                    }`}
                  >
                    {waitMetric.improvement_pct > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    <span>{waitMetric.improvement_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Speed Card */}
            {speedMetric && (
              <div className="p-5 border rounded-2xl bg-[#080706]/58 border-[rgba(255,145,40,0.16)] flex flex-col justify-between h-40 font-mono text-xs shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-[#9D8C7B] tracking-wider">Network Speed</span>
                  <Gauge className="h-4 w-4 text-brand-orange" />
                </div>
                <div className="space-y-1 my-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">Base:</span>
                    <span className="font-bold">{speedMetric.baseline.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-pale">PPO:</span>
                    <span className="font-bold text-brand-orange">{speedMetric.ppo.toFixed(1)} km/h</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[8px] text-[#9D8C7B]">IMPROVEMENT</span>
                  <div
                    className={`flex items-center text-[10px] font-bold ${
                      speedMetric.improvement_pct > 0 ? "text-eco-success" : "text-eco-danger"
                    }`}
                  >
                    {speedMetric.improvement_pct > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-0.5" />
                    )}
                    <span>{speedMetric.improvement_pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Series Recharts Curves */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CO2 Emissions over time */}
              <GlassChart
                title="CO₂ Cumulative Emission Profile"
                subtitle="Carbon abatement curve comparison (measured in grams)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="stepLabel" stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <YAxis stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20, 15, 10, 0.95)",
                        border: "1px solid rgba(255, 184, 77, 0.25)",
                        borderRadius: "8px",
                        fontSize: 10,
                        fontFamily: "monospace"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="co2_baseline" name="Baseline (FT)" stroke="#A89582" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="co2_ppo" name="PPO Agent" stroke="#FF8A00" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassChart>

              {/* NOx Emissions over time */}
              <GlassChart
                title="NOx Emission Trajectory"
                subtitle="Nitrogen oxide levels comparison (measured in grams)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="stepLabel" stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <YAxis stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20, 15, 10, 0.95)",
                        border: "1px solid rgba(255, 184, 77, 0.25)",
                        borderRadius: "8px",
                        fontSize: 10,
                        fontFamily: "monospace"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="nox_baseline" name="Baseline (FT)" stroke="#A89582" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="nox_ppo" name="PPO Agent" stroke="#FF8A00" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassChart>

              {/* Waiting Time over time */}
              <GlassChart
                title="Network Waiting Time Curve"
                subtitle="Congestion accumulation delay curve (measured in seconds)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="stepLabel" stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <YAxis stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20, 15, 10, 0.95)",
                        border: "1px solid rgba(255, 184, 77, 0.25)",
                        borderRadius: "8px",
                        fontSize: 10,
                        fontFamily: "monospace"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="wait_baseline" name="Baseline (FT)" stroke="#A89582" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="wait_ppo" name="PPO Agent" stroke="#FF8A00" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassChart>

              {/* Speed over time */}
              <GlassChart
                title="Network Average Velocity Profile"
                subtitle="Urban speed optimization curves (measured in km/h)"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="stepLabel" stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <YAxis stroke="#9D8C7B" tick={{ fill: "#9D8C7B", fontSize: 8, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20, 15, 10, 0.95)",
                        border: "1px solid rgba(255, 184, 77, 0.25)",
                        borderRadius: "8px",
                        fontSize: 10,
                        fontFamily: "monospace"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: "monospace" }} />
                    <Line type="monotone" dataKey="speed_baseline" name="Baseline (FT)" stroke="#A89582" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="speed_ppo" name="PPO Agent" stroke="#FF8A00" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassChart>
            </div>
          )}

          {/* Summary table */}
          <GlassPanel className="p-6">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#9D8C7B] mb-4 border-b border-[rgba(255,183,106,0.12)] pb-3 flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-brand-orange" />
              <span>Comparative Performance Table</span>
            </h3>

            <GlassTable headers={["Metric", "Baseline", "PPO Policy", "Difference", "Improvement"]}>
              {comparisonReport.metrics.map((row: ComparisonMetrics, idx: number) => {
                const isPositive = row.improvement_pct > 0;

                return (
                  <tr key={idx} className="hover:bg-brand-orange/5 text-text-cream transition-colors font-mono">
                    <td className="p-4.5 border-none font-sans font-bold text-text-cream">{row.metric}</td>
                    <td className="p-4.5 text-right font-mono border-none text-text-pale">
                      {row.baseline.toFixed(1)}
                    </td>
                    <td className="p-4.5 text-right font-mono border-none text-brand-orange font-bold">
                      {row.ppo.toFixed(1)}
                    </td>
                    <td className="p-4.5 text-right font-mono border-none text-[#FFB84D]">
                      {row.diff_absolute > 0 ? "+" : ""}
                      {row.diff_absolute.toFixed(1)}
                    </td>
                    <td
                      className={`p-4.5 text-right font-bold border-none flex items-center justify-end gap-1 ${
                        isPositive ? "text-eco-success" : "text-eco-danger"
                      }`}
                    >
                      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>{row.improvement_pct.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </GlassTable>
          </GlassPanel>

          {/* Run Summary Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <GlassPanel className="p-5 space-y-3 border-t-2 border-t-brand-orange">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Cpu className="h-4.5 w-4.5 text-brand-orange" />
                <span className="font-bold text-[#FFF7ED]">PPO RUN SESSION METADATA</span>
              </div>
              <div className="space-y-1 text-text-pale text-[11px]">
                <div>
                  UUID: <span className="text-[#FFF7ED] select-all">{sessionPair?.ppo}</span>
                </div>
                <div>
                  CONTROLLER TYPE: <span className="text-brand-orange uppercase font-bold">PPO Reinforcement Learning</span>
                </div>
                <div>
                  SIMULATION DURATION: <span className="text-[#FFF7ED]">{comparisonReport.duration_steps} steps</span>
                </div>
                <div>
                  COMPLETED METRICS STATUS: <span className="text-[#39D98A] font-bold">✓ STORED IN DATABASE</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5 space-y-3 border-t-2 border-t-[#A89582]">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Settings className="h-4.5 w-4.5 text-[#A89582]" />
                <span className="font-bold text-[#FFF7ED]">BASELINE RUN SESSION METADATA</span>
              </div>
              <div className="space-y-1 text-text-pale text-[11px]">
                <div>
                  UUID: <span className="text-[#FFF7ED] select-all">{sessionPair?.baseline}</span>
                </div>
                <div>
                  CONTROLLER TYPE: <span className="text-text-cream uppercase font-bold">Fixed-Time Signal Program</span>
                </div>
                <div>
                  SIMULATION DURATION: <span className="text-[#FFF7ED]">{comparisonReport.duration_steps} steps</span>
                </div>
                <div>
                  COMPLETED METRICS STATUS: <span className="text-[#39D98A] font-bold">✓ STORED IN DATABASE</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      )}

      {!comparisonReport && !isLoadingData && (
        <div className="py-24 text-center text-xs text-[#A9947D] rounded-[24px] border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-2xl max-w-xl mx-auto space-y-4 font-mono">
          <Layers className="h-10 w-10 text-text-muted/45 mx-auto animate-pulse" />
          <h4 className="font-bold text-text-cream uppercase tracking-widest font-mono">
            No Comparison Selected
          </h4>
          <p className="text-text-pale leading-relaxed font-sans max-w-xs mx-auto">
            Select completed simulation sessions above or load the pre-trained seeded comparison to evaluate results.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2 bg-brand-orange hover:bg-brand-bright text-[#050505] font-bold rounded-lg text-[10px] uppercase tracking-wider font-mono transition-all cursor-pointer shadow-md"
            >
              Load Demo Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
