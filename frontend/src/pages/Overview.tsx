import { useSimulationStore } from "../store/simulationStore";
import { 
  Users, 
  Gauge, 
  Clock, 
  Leaf, 
  Activity, 
  Droplet,
  AlertTriangle,
  Play
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
import { useMutation } from "@tanstack/react-query";
import { startSimulation, resumeSimulation, getSimulationStatus } from "../api/simulation";
import { toast } from "../utils/toast";
import { webSocketService } from "../services/websocket";

// Tiny helper to generate sparkline telemetry data
const generateSparklineData = (currentVal: number, seed = 0.5) => {
  return Array.from({ length: 10 }, (_, i) => ({
    val: currentVal * (0.85 + Math.sin(i + seed) * 0.15 + (i * 0.01))
  }));
};

export default function Overview() {
  const wsState = useSimulationStore();
  
  // Keep a small history for the emissions chart
  const [emissionsHistory, setEmissionsHistory] = useState<{ time: string; co2: number }[]>([]);

  useEffect(() => {
    if (wsState.running && wsState.co2 > 0) {
      setEmissionsHistory((prev) => {
        const timeStr = `${wsState.simulationTime.toFixed(0)}s`;
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          return prev;
        }
        const next = [...prev, { time: timeStr, co2: wsState.co2 }];
        return next.slice(-20); // Keep last 20 frames
      });
    }
  }, [wsState.simulationTime, wsState.co2, wsState.running]);

  // Start simulation mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      const startData = await startSimulation({
        scenario: "normal",
        gui: false,
        duration: 1000,
        step_length: 1.0,
        controller: "fixed_time",
      });
      wsState.setSimulationStatus(startData);

      const resumeData = await resumeSimulation();
      wsState.setSimulationStatus(resumeData);

      const statusData = await getSimulationStatus();
      wsState.setSimulationStatus(statusData);

      return statusData;
    },
    onSuccess: async () => {
      await wsState.fetchSimulationMetrics();
      webSocketService.connect();
      toast("Simulation started.", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to start simulation.", "error");
    }
  });

  const getDotColor = (status: boolean | string | undefined) => {
    if (status === true || status === "healthy" || status === "ok" || status === "connected") {
      return "bg-[#FF8A00] shadow-[0_0_8px_#FF8A00]";
    }
    return "bg-[#7A6A5C]";
  };

  // Stopped state UI overlay (Premium Onboarding State)
  if (!wsState.running) {
    return (
      <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="glass-panel max-w-xl w-full p-12 text-center shadow-2xl border border-[#75451A]/30 space-y-8">
          <Leaf className="h-12 w-12 text-[#FF8A00] mx-auto animate-pulse" />
          
          <div className="space-y-2">
            <h3 className="font-bold text-2xl text-[#FFF3E5] tracking-wide uppercase font-sans">
              OPERATIONS COMMAND INACTIVE
            </h3>
            <p className="text-[#FFD2A3] text-sm leading-relaxed max-w-sm mx-auto">
              Start a SUMO session to activate the digital twin.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="glass-button-accent text-sm tracking-widest px-8 py-3.5 rounded-full hover:scale-105 duration-200 uppercase font-bold flex items-center gap-2 mx-auto"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>{startMutation.isPending ? "Starting..." : "Start Simulation"}</span>
            </button>
          </div>

          {/* System states indicators inside onboarding */}
          <div className="border-t border-[#75451A]/20 pt-6 flex justify-center gap-8 text-[10px] font-mono uppercase tracking-wider text-[#9A8575]">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(wsState.sumoStatus)}`} />
              <span>SUMO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(wsState.traciStatus)}`} />
              <span>TraCI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${getDotColor(wsState.ppoStatus)}`} />
              <span>PPO</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live KPI elements mapping
  const kpis = [
    {
      id: "vehicles",
      title: "Active Vehicles",
      value: wsState.totalVehicles,
      unit: "qty",
      icon: Users,
      color: "text-[#FFA347]",
      sparkColor: "#FFA347",
    },
    {
      id: "speed",
      title: "Average Speed",
      value: wsState.averageSpeed.toFixed(1),
      unit: "km/h",
      icon: Gauge,
      color: "text-[#FFD2A3]",
      sparkColor: "#FFD2A3",
    },
    {
      id: "waiting",
      title: "Avg Waiting Time",
      value: wsState.averageWaitingTime.toFixed(1),
      unit: "sec",
      icon: Clock,
      color: "text-[#FFB84D]",
      sparkColor: "#FFB84D",
    },
    {
      id: "co2",
      title: "CO₂ Emission Rate",
      value: (wsState.co2 / 1000).toFixed(2), // convert mg to grams
      unit: "g/s",
      icon: Leaf,
      color: "text-[#FF8A00]",
      sparkColor: "#FF8A00",
    },
    {
      id: "nox",
      title: "NOx Emission Rate",
      value: (wsState.nox / 1000).toFixed(2),
      unit: "g/s",
      icon: Activity,
      color: "text-[#E06C00]",
      sparkColor: "#E06C00",
    },
    {
      id: "fuel",
      title: "Fuel Consumption",
      value: (wsState.fuel / 1000).toFixed(2), // convert ml to Liters
      unit: "L/s",
      icon: Droplet,
      color: "text-[#FFE7CC]",
      sparkColor: "#FFE7CC",
    },
  ];

  // List of high-wait delayed vehicles
  const delayedVehicles = wsState.vehicles
    .filter((v) => v.waiting_time > 30)
    .sort((a, b) => b.waiting_time - a.waiting_time)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Operations Command Center</h1>
        <p className="text-[#FFD2A3] text-sm mt-1">
          Real-time urban carbon intelligence and traffic signal telemetry.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const sparkData = generateSparklineData(Number(kpi.value), kpi.title.length);

          return (
            <div key={kpi.id} className="glass-panel glass-panel-hover p-6 flex flex-col justify-between h-48 border border-[#75451A]/20 shadow-2xl">
              <div>
                <div className="flex justify-between items-center text-[#9A8575]">
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{kpi.title}</span>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-[#FFE7CC] font-mono">
                    {kpi.value}
                  </span>
                  <span className="text-[11px] text-[#9A8575] font-bold uppercase font-mono">{kpi.unit}</span>
                </div>
              </div>

              {/* Sparkline & trend info */}
              <div className="mt-6 flex items-center justify-between border-t border-[#75451A]/10 pt-3">
                <span className="text-[9px] font-mono uppercase text-[#9A8575]">Live Stream</span>

                {/* Micro Sparkline */}
                <div className="h-8 w-24">
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
        <div className="lg:col-span-2 glass-panel p-6 border border-[#75451A]/20 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono mb-1">CO₂ Emission Dispersion</h3>
            <p className="text-xs text-[#FFD2A3] mb-6">Real-time CO₂ rate flow in the traffic network (measured in mg/s).</p>
          </div>
          
          <div className="h-64">
            {emissionsHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsHistory}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 9, fontFamily: 'monospace' }} />
                  <YAxis stroke="#555" tickLine={false} tick={{ fill: '#9A8575', fontSize: 9, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ background: "#11100E", border: "1px solid rgba(255,163,71,0.15)", borderRadius: "8px", fontSize: 11 }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#FF8A00" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCo2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#9A8575] text-xs border border-dashed border-[#75451A]/20 rounded-lg">
                <span>Waiting for simulation telemetry...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 col: Active Hotspots & Delay Warnings */}
        <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 border-b border-[#75451A]/10 pb-3">
              <AlertTriangle className="h-4.5 w-4.5 text-[#FF4D4D]" />
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Delay Alerts</h3>
            </div>
            <p className="text-xs text-[#FFD2A3] mb-6">Vehicles experiencing excessive wait times (&gt;30s).</p>

            <div className="space-y-3">
              {delayedVehicles.length > 0 ? (
                delayedVehicles.map((v) => (
                  <div key={v.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <div className="font-semibold text-text-primary">ID: {v.id}</div>
                      <div className="text-[9px] text-[#9A8575] mt-0.5">Lane: {v.lane_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FF8A00]">{v.waiting_time.toFixed(0)}s</div>
                      <div className="text-[9px] text-[#9A8575] mt-0.5">Wait</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                  No delayed vehicles detected.
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[#75451A]/10 mt-6 text-center text-[9px] text-[#9A8575] font-mono uppercase tracking-wider">
            Auto-Sync Active (SUMO)
          </div>
        </div>
      </div>
    </div>
  );
}
