import { useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getHistoricalMetrics } from "../api/metrics";
import { useState, useEffect } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from "recharts";
import { BarChart3, AlertTriangle, ShieldCheck } from "lucide-react";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassChart } from "../components/glass/GlassChart";
import { useLocationStore } from "../store/locationStore";

export default function Analytics() {
  const wsState = useSimulationStore();
  const { city, locality, source } = useLocationStore();
  const [querySessionId, setQuerySessionId] = useState(wsState.sessionId || "");

  useEffect(() => {
    if (wsState.sessionId) {
      setQuerySessionId(wsState.sessionId);
    }
  }, [wsState.sessionId]);

  const { data: metricsHistory, isLoading, error, refetch } = useQuery({
    queryKey: ["metricsHistory", querySessionId],
    queryFn: () => getHistoricalMetrics(querySessionId),
    enabled: !!querySessionId,
    refetchInterval: wsState.running && !wsState.paused ? 5000 : false,
  });

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (querySessionId.trim()) {
      refetch();
    }
  };

  const renderAnalyticsChart = (
    title: string, 
    dataKey: keyof any, 
    color: string, 
    unit: string, 
    scaleDivider = 1
  ) => {
    if (isLoading) {
      return <div className="h-48 bg-[#050505]/45 rounded-xl shimmer animate-pulse" />;
    }

    if (error || !metricsHistory || metricsHistory.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
          Awaiting telemetry history...
        </div>
      );
    }

    const chartData = metricsHistory.map((item: any) => ({
      step: `S${item.step}`,
      val: item[dataKey] / scaleDivider,
    }));

    return (
      <GlassChart title={title} subtitle={`Historical curves (measured in ${unit})`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
            <XAxis dataKey="step" stroke="#A9947D" tickLine={false} tick={{ fill: '#D6C3AE', fontSize: 8, fontFamily: 'monospace' }} />
            <YAxis stroke="#A9947D" tickLine={false} tick={{ fill: '#D6C3AE', fontSize: 8, fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ background: "rgba(20, 15, 10, 0.90)", border: "1px solid rgba(255, 184, 77, 0.25)", borderRadius: "8px", fontSize: 10, fontFamily: 'monospace' }}
            />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.06} 
              strokeWidth={1.5} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </GlassChart>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Metrics Workspace</h1>
          <p className="text-text-pale text-xs mt-1">
            Deep dive historical time-series analytics of traffic performance and carbon emissions.
          </p>
        </div>

        {/* Session Query Input */}
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Session UUID..."
            value={querySessionId}
            onChange={(e) => setQuerySessionId(e.target.value)}
            className="px-3.5 py-1.5 bg-[#120D09]/45 border border-[rgba(255,184,77,0.22)] rounded-lg text-xs font-mono text-[#FFF7ED] w-64 placeholder:text-[#A9947D] focus:ring-1 focus:ring-brand-orange"
          />
          <GlassButton
            type="submit"
            variant="secondary"
            size="sm"
            className="font-mono text-[10px] uppercase font-bold tracking-widest h-8"
          >
            Analyze
          </GlassButton>
        </form>
      </div>

      {/* Warning if no session */}
      {!querySessionId && (
        <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-18rem)]">
          <GlassPanel className="max-w-xl w-full text-center space-y-4">
            <AlertTriangle className="h-10 w-10 text-brand-amber mx-auto animate-pulse" />
            <h4 className="font-bold text-text-cream text-sm uppercase tracking-widest font-mono">No Active Session</h4>
            <p className="text-text-pale text-xs leading-relaxed max-w-xs mx-auto">
              Awaiting active simulation session ID. Launch a SUMO run to start capturing metrics.
            </p>
          </GlassPanel>
        </div>
      )}

      {querySessionId && (
        <div className="space-y-6">
          {/* Active session banner */}
          <div className="p-4 rounded-[18px] border border-[rgba(255,184,77,0.16)] bg-white/5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider">
            <div className="flex items-center gap-3 text-text-pale">
              <BarChart3 className="h-4.5 w-4.5 text-brand-orange" />
              <span>Analyzing Run Session: <span className="font-bold text-text-cream font-mono">{querySessionId}</span></span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-[#FF8A00] border border-[#FF8A00]/30">
                LOC: {city || locality || "Target Area"} ({source})
              </span>
            </div>
            
            {wsState.running && wsState.sessionId === querySessionId && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#39D98A]/10 text-[#39D98A] animate-pulse font-mono border border-[#39D98A]/20">
                <ShieldCheck className="h-3.5 w-3.5" /> LIVE POLLING ACTIVE
              </span>
            )}
          </div>

          {/* Grid of charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAnalyticsChart("CO₂ Emissions", "total_co2", "#FF8A00", "grams", 1000)}
            {renderAnalyticsChart("NOx Emissions", "total_nox", "#E06C00", "grams", 1000)}
            {renderAnalyticsChart("Average Speed", "average_speed", "#FFD2A3", "km/h")}
            {renderAnalyticsChart("Average Waiting Time", "average_waiting_time", "#FFB84D", "seconds")}
            {renderAnalyticsChart("Active Vehicle Count", "vehicle_count", "#FFE7CC", "qty")}
            {renderAnalyticsChart("Fuel Consumption", "total_fuel", "#FFF3E5", "Liters", 1000)}
            {renderAnalyticsChart("Reinforcement Learning Reward", "reward", "#FFA347", "score")}
            {renderAnalyticsChart("Traffic Throughput Efficiency", "average_speed", "#FFD2A3", "index")}
          </div>
        </div>
      )}
    </div>
  );
}
