import { useQuery } from "@tanstack/react-query";
import { getSystemHealth, getSystemReadiness } from "../api/health";
import { useSimulationStore } from "../store/simulationStore";
import { 
  Activity, 
  Cpu, 
  Database, 
  Layers, 
  Terminal, 
  Radio 
} from "lucide-react";
import { SystemHealthResponse } from "../types";

export default function SystemHealth() {
  const wsState = useSimulationStore();

  // Queries
  const { data: healthData, isLoading: isLoadingHealth } = useQuery<SystemHealthResponse, Error>({
    queryKey: ["systemHealth"],
    queryFn: getSystemHealth,
    refetchInterval: 5000,
  });

  const { data: readyData } = useQuery<{ status: string }, Error>({
    queryKey: ["systemReady"],
    queryFn: getSystemReadiness,
    refetchInterval: 5000,
  });

  const getStatusColor = (status: boolean | string | undefined) => {
    if (status === true || status === "healthy" || status === "ok" || status === "connected") {
      return "text-[#FF8A00] bg-[#FF8A00]/5 border-[#FF8A00]/20";
    }
    return "text-[#9A8575] bg-white/5 border-white/5";
  };

  const getDotColor = (status: boolean | string | undefined) => {
    if (status === true || status === "healthy" || status === "ok" || status === "connected") {
      return "bg-[#FF8A00] shadow-[0_0_8px_#FF8A00]";
    }
    if (status === "connecting") {
      return "bg-[#FFA347] shadow-[0_0_8px_#FFA347] animate-pulse";
    }
    if (status === "paused") {
      return "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D]";
    }
    if (status === "error") {
      return "bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]";
    }
    return "bg-[#7A6A5C]"; // offline
  };

  const components = [
    {
      id: "api",
      name: "FastAPI REST Server",
      description: "Aggregates Pydantic simulation schemas and exposes endpoints for control overrides.",
      status: readyData ? "healthy" : "offline",
      icon: Cpu,
    },
    {
      id: "db",
      name: "SQLite Database",
      description: "Stores historical simulation runs, step aggregate snapshots, and baseline compare histories.",
      status: healthData?.status === "ok" ? "healthy" : "offline",
      icon: Database,
    },
    {
      id: "sumo",
      name: "SUMO Simulator",
      description: "Microscopic space-continuous traffic simulation engine (Eclipse SUMO).",
      status: wsState.sumoStatus,
      icon: Layers,
    },
    {
      id: "traci",
      name: "TraCI Connection API",
      description: "Python-SUMO interface APIs to mutate signal phases in real-time step callbacks.",
      status: wsState.traciStatus,
      icon: Terminal,
    },
    {
      id: "ppo",
      name: "PPO Policy Neural Model",
      description: "Trained Proximal Policy Optimization reinforcement learning controller.",
      status: wsState.ppoStatus,
      icon: Activity,
    },
    {
      id: "ws",
      name: "WebSocket Streaming",
      description: "Event-loop stream pushing state telemetry frames from backend simulation steps.",
      status: wsState.connectionState,
      icon: Radio,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">System Status & Diagnostics</h1>
        <p className="text-[#FFD2A3] text-sm mt-1">
          Monitor diagnostics and connectivity for all services in the EcoTwin twin pipeline.
        </p>
      </div>

      {isLoadingHealth ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-44 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-44 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-44 bg-white/5 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((c) => {
            const Icon = c.icon;
            const statusClass = getStatusColor(c.status);
            const dotClass = getDotColor(c.status);

            return (
              <div key={c.id} className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl flex flex-col justify-between h-48 font-mono">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#FFF3E5] uppercase tracking-wide">{c.name}</span>
                    <Icon className="h-4.5 w-4.5 text-[#9A8575]" />
                  </div>
                  <p className="text-[11px] text-[#FFD2A3] font-sans leading-relaxed mt-2.5">
                    {c.description}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-[#75451A]/10 pt-3 mt-4 text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                    <span>Status</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded font-bold ${statusClass}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
