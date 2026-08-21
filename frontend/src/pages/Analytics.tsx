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
  
  // State for session ID query
  const [querySessionId, setQuerySessionId] = useState(wsState.sessionId || "");

  // Auto-sync with active session ID
  useEffect(() => {
    if (wsState.sessionId) {
      setQuerySessionId(wsState.sessionId);
    }
  }, [wsState.sessionId]);

  // Query history
  const { data: metricsHistory, isLoading, error, refetch } = useQuery({
    queryKey: ["metricsHistory", querySessionId],
    queryFn: () => getHistoricalMetrics(querySessionId),
    enabled: !!querySessionId,
    refetchInterval: wsState.running && !wsState.paused ? 5000 : false, // Poll when running
  });

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (querySessionId.trim()) {
      refetch();
    }
  };

  // Render chart helper
  const renderAnalyticsChart = (
    title: string, 
    dataKey: keyof any, 
    color: string, 
    unit: string, 
    scaleDivider = 1
  ) => {
    if (isLoading) {
      return <div className="h-48 bg-bg-secondary rounded animate-pulse" />;
    }

    if (error || !metricsHistory || metricsHistory.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-xs text-text-muted border border-dashed border-border rounded-lg">
          No metrics history available.
        </div>
      );
    }

    // Map data and scale if necessary
    const chartData = metricsHistory.map((item: any) => ({
      step: `Step ${item.step}`,
      val: item[dataKey] / scaleDivider,
    }));

    return (
      <div className="bg-white border border-border rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-text-secondary border-b border-border pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">{title}</span>
          <span className="text-[10px] font-mono">{unit}</span>
        </div>
        
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="step" stroke="#94A3B8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: 10 }}
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
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Metrics Workspace</h1>
          <p className="text-text-secondary text-sm mt-1">
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
            className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-mono text-text-primary w-64 placeholder:text-text-muted"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-eco-forest hover:bg-eco-forest/90 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Warning if no session id */}
      {!querySessionId && (
        <div className="bg-traffic-yellow/5 border border-traffic-yellow/20 rounded-xl p-6 text-center space-y-3 max-w-xl mx-auto">
          <AlertTriangle className="h-8 w-8 text-traffic-yellow mx-auto" />
          <h4 className="font-bold text-text-primary text-sm">No Active Session ID</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Please copy a past session UUID from logs or start a live simulation to automatically load charts.
          </p>
        </div>
      )}

      {querySessionId && (
        <div className="space-y-6">
          {/* Active session banner */}
          <div className="p-4 bg-white border border-border rounded-xl shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-text-secondary">
              <BarChart3 className="h-4.5 w-4.5 text-eco-green" />
              <span>Analyzing Run Session: <span className="font-mono font-bold text-text-primary">{querySessionId}</span></span>
            </div>
            
            {wsState.running && wsState.sessionId === querySessionId && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-eco-green/10 text-eco-green animate-pulse">
                <ShieldCheck className="h-3 w-3" /> Live session polling active
              </span>
            )}
          </div>

          {/* Grid of charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderAnalyticsChart("CO₂ Emissions", "co2_emission", "#EA580C", "grams", 1000)}
            {renderAnalyticsChart("NOx Emissions", "nox_emission", "#DC2626", "grams", 1000)}
            {renderAnalyticsChart("Average Speed", "average_speed", "#06B6D4", "km/h")}
            {renderAnalyticsChart("Average Waiting Time", "average_waiting_time", "#EAB308", "seconds")}
            {renderAnalyticsChart("Active Vehicle Count", "vehicle_count", "#334155", "qty")}
            {renderAnalyticsChart("Fuel Consumption", "fuel_consumption", "#16A34A", "Liters", 1000)}
            {renderAnalyticsChart("Reinforcement Learning Reward", "reward", "#A855F7", "score")}
            {renderAnalyticsChart("Traffic Throughput Efficiency", "average_speed", "#0EA5A4", "index")}
          </div>
        </div>
      )}
    </div>
  );
}
