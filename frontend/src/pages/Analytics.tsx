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

export default function Analytics() {
  const wsState = useSimulationStore();
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
      return <div className="h-48 bg-white/5 rounded-xl animate-pulse" />;
    }

    if (error || !metricsHistory || metricsHistory.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg font-mono">
          Awaiting telemetry history...
        </div>
      );
    }

    const chartData = metricsHistory.map((item: any) => ({
      step: `S${item.step}`,
      val: item[dataKey] / scaleDivider,
    }));

    return (
      <div className="glass-panel p-4 border border-[#75451A]/20 shadow-2xl space-y-3">
        <div className="flex justify-between items-center text-text-secondary border-b border-[#75451A]/10 pb-2 font-mono">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A8575]">{title}</span>
          <span className="text-[9px] font-bold uppercase text-[#FFF3E5]">{unit}</span>
        </div>
        
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
              <XAxis dataKey="step" stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 8, fontFamily: 'monospace' }} />
              <YAxis stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 8, fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ background: "#11100E", border: "1px solid rgba(255,163,71,0.15)", borderRadius: "8px", fontSize: 10 }}
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
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Metrics Workspace</h1>
          <p className="text-[#FFD2A3] text-sm mt-1">
            Deep dive historical time-series analytics of traffic performance and carbon emissions.
          </p>
        </div>

        {/* Session Query Field */}
        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Session UUID..."
            value={querySessionId}
            onChange={(e) => setQuerySessionId(e.target.value)}
            className="px-3 py-1.5 bg-[#11100E] border border-[#75451A]/35 rounded-lg text-xs font-mono text-[#FFF3E5] w-64 placeholder:text-[#9A8575] focus:ring-1 focus:ring-[#FF8A00]"
          />
          <button
            type="submit"
            className="glass-button text-xs font-bold font-mono tracking-wider uppercase h-8"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Warning if no session id */}
      {!querySessionId && (
        <div className="glass-panel p-8 text-center space-y-3 max-w-xl mx-auto border border-[#75451A]/20 shadow-2xl">
          <AlertTriangle className="h-8 w-8 text-[#FFB84D] mx-auto animate-pulse" />
          <h4 className="font-bold text-[#FFF3E5] text-sm tracking-wide uppercase">No Active Session ID</h4>
          <p className="text-xs text-[#FFD2A3] leading-relaxed font-mono">
            Awaiting active simulation stream. Launch a SUMO session to automatically map performance curves.
          </p>
        </div>
      )}

      {querySessionId && (
        <div className="space-y-6">
          {/* Active session banner */}
          <div className="p-4 glass-card border border-[#75451A]/20 shadow-sm flex items-center justify-between text-xs font-mono uppercase tracking-wider">
            <div className="flex items-center gap-2 text-[#FFD2A3]">
              <BarChart3 className="h-4.5 w-4.5 text-[#FF8A00]" />
              <span>Analyzing Run Session: <span className="font-bold text-white">{querySessionId}</span></span>
            </div>
            
            {wsState.running && wsState.sessionId === querySessionId && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF8A00]/10 text-[#FF8A00] animate-pulse">
                <ShieldCheck className="h-3 w-3" /> Live polling active
              </span>
            )}
          </div>

          {/* Grid of charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAnalyticsChart("CO₂ Emissions", "co2_emission", "#FF8A00", "grams", 1000)}
            {renderAnalyticsChart("NOx Emissions", "nox_emission", "#E06C00", "grams", 1000)}
            {renderAnalyticsChart("Average Speed", "average_speed", "#FFD2A3", "km/h")}
            {renderAnalyticsChart("Average Waiting Time", "average_waiting_time", "#FFB84D", "seconds")}
            {renderAnalyticsChart("Active Vehicle Count", "vehicle_count", "#FFE7CC", "qty")}
            {renderAnalyticsChart("Fuel Consumption", "fuel_consumption", "#FFF3E5", "Liters", 1000)}
            {renderAnalyticsChart("Reinforcement Learning Reward", "reward", "#FFA347", "score")}
            {renderAnalyticsChart("Traffic Throughput Efficiency", "average_speed", "#FFD2A3", "index")}
          </div>
        </div>
      )}
    </div>
  );
}
