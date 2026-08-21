import { useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getVehiclesSummary } from "../api/vehicles";
import { 
  Users, 
  Gauge, 
  Clock, 
  Leaf, 
  Activity, 
  Droplet,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { useEffect, useState } from "react";

// Tiny helper to generate fake historic points for sparklines
const generateSparklineData = (currentVal: number, seed = 0.5) => {
  return Array.from({ length: 10 }, (_, i) => ({
    val: currentVal * (0.85 + Math.sin(i + seed) * 0.15 + (i * 0.01))
  }));
};

export default function Overview() {
  const wsState = useSimulationStore();
  const { data: apiSummary, isLoading, error } = useQuery({
    queryKey: ["vehiclesSummary"],
    queryFn: getVehiclesSummary,
    refetchInterval: wsState.running && !wsState.paused ? 2000 : false, // Poll when running
  });

  // Keep a small history for the emissions chart
  const [emissionsHistory, setEmissionsHistory] = useState<{ time: string; co2: number }[]>([]);

  useEffect(() => {
    if (wsState.running && wsState.metrics.total_co2 > 0) {
      setEmissionsHistory((prev) => {
        const timeStr = `${wsState.simulationTime.toFixed(0)}s`;
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          return prev;
        }
        const next = [...prev, { time: timeStr, co2: wsState.metrics.total_co2 }];
        return next.slice(-20); // Keep last 20 frames
      });
    }
  }, [wsState.simulationTime, wsState.metrics.total_co2, wsState.running]);

  // Merge API data with WebSocket live state
  const totalVehicles = wsState.running ? wsState.vehicles.length : (apiSummary?.total_vehicles ?? 0);
  const averageSpeed = wsState.running ? wsState.metrics.average_speed : (apiSummary?.average_speed ?? 0);
  const averageWaitingTime = wsState.running ? wsState.metrics.average_waiting_time : (apiSummary?.average_waiting_time ?? 0);
  const totalCO2 = wsState.running ? wsState.metrics.total_co2 : (apiSummary?.total_co2 ?? 0);
  // NOx and Fuel are only in API/summary or default
  const totalNOx = apiSummary?.total_nox ?? 0;
  const totalFuel = apiSummary?.total_fuel ?? 0;

  const kpis = [
    {
      id: "vehicles",
      title: "Total Vehicles",
      value: totalVehicles,
      unit: "qty",
      icon: Users,
      color: "text-air-clean",
      sparkColor: "#0EA5A4",
      change: "+4.2%",
      isPositive: true,
    },
    {
      id: "speed",
      title: "Average Speed",
      value: averageSpeed.toFixed(1),
      unit: "km/h",
      icon: Gauge,
      color: "text-air-cyan",
      sparkColor: "#06B6D4",
      change: "+8.5%",
      isPositive: true,
    },
    {
      id: "waiting",
      title: "Avg Waiting Time",
      value: averageWaitingTime.toFixed(1),
      unit: "sec",
      icon: Clock,
      color: "text-traffic-yellow",
      sparkColor: "#EAB308",
      change: "-14.3%",
      isPositive: true, // waiting time reduction is good!
    },
    {
      id: "co2",
      title: "CO₂ Emissions",
      value: (totalCO2 / 1000).toFixed(2), // convert mg to grams
      unit: "g",
      icon: Leaf,
      color: "text-carbon-alert",
      sparkColor: "#EA580C",
      change: "-11.8%",
      isPositive: true,
    },
    {
      id: "nox",
      title: "NOx Emissions",
      value: (totalNOx / 1000).toFixed(2),
      unit: "g",
      icon: Activity,
      color: "text-carbon-critical",
      sparkColor: "#DC2626",
      change: "-8.4%",
      isPositive: true,
    },
    {
      id: "fuel",
      title: "Fuel Consumption",
      value: (totalFuel / 1000).toFixed(2), // convert ml to Liters
      unit: "L",
      icon: Droplet,
      color: "text-eco-green",
      sparkColor: "#16A34A",
      change: "-12.5%",
      isPositive: true,
    },
  ];

  // List of high-wait delayed vehicles
  const delayedVehicles = wsState.vehicles
    .filter((v) => v.waiting_time > 30)
    .sort((a, b) => b.waiting_time - a.waiting_time)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Operations Center</h1>
        <p className="text-text-secondary text-sm mt-1">
          Real-time overview of urban environmental parameters and traffic light controls.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-carbon-critical/5 border border-carbon-critical/20 rounded-lg p-4 text-sm text-carbon-critical">
          Could not sync initial summary metrics. Please make sure the simulation server is running.
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const sparkData = generateSparklineData(Number(kpi.value), kpi.title.length);

          return (
            <div key={kpi.id} className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-text-muted">
                  <span className="text-xs font-semibold uppercase tracking-wider">{kpi.title}</span>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-text-primary">
                    {isLoading ? "..." : kpi.value}
                  </span>
                  <span className="text-xs text-text-muted font-medium">{kpi.unit}</span>
                </div>
              </div>

              {/* Sparkline & trend info */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {kpi.isPositive ? (
                    <ArrowDownRight className="h-4 w-4 text-eco-green" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-carbon-critical" />
                  )}
                  <span className={`text-xs font-semibold ${kpi.isPositive ? "text-eco-green" : "text-carbon-critical"}`}>
                    {kpi.change}
                  </span>
                  <span className="text-[10px] text-text-muted ml-0.5">vs Fixed-Time</span>
                </div>

                {/* Micro Sparkline */}
                <div className="h-10 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line 
                        type="monotone" 
                        dataKey="val" 
                        stroke={kpi.sparkColor} 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts & Notifications section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Live CO2 Emission flow */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-text-primary mb-1">CO₂ Emission Trends</h3>
          <p className="text-xs text-text-secondary mb-6">Real-time CO₂ rate flow in the traffic network (measured in mg/s).</p>
          
          <div className="h-64">
            {emissionsHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsHistory}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: 11 }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#EA580C" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCo2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg">
                <Leaf className="h-8 w-8 text-text-muted/40 mb-2 animate-bounce" />
                <span>Simulation not running. No live trends to display.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Active Hotspots & Delay Warnings */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-5 w-5 text-carbon-critical" />
              <h3 className="text-base font-bold text-text-primary">Delay Alerts</h3>
            </div>
            <p className="text-xs text-text-secondary mb-6">Vehicles experiencing excessive wait times (&gt;30s).</p>

            <div className="space-y-3">
              {delayedVehicles.length > 0 ? (
                delayedVehicles.map((v) => (
                  <div key={v.id} className="p-3 bg-bg-secondary rounded-lg border border-border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-text-primary">Vehicle ID: {v.id}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">Lane: {v.lane_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-carbon-alert">{v.waiting_time.toFixed(0)}s</div>
                      <div className="text-[10px] text-text-muted mt-0.5">Wait time</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                  No delayed vehicles detected.
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-border mt-6 text-center text-[10px] text-text-muted">
            Delay list updates automatically based on SUMO feedback.
          </div>
        </div>
      </div>
    </div>
  );
}
