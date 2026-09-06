import { useQuery } from "@tanstack/react-query";
import { getSystemHealth, getSystemReadiness } from "../api/health";
import { useSimulationStore } from "../store/simulationStore";
import { 
  Activity, 
  Cpu, 
  Database, 
  Layers, 
  Terminal, 
  Radio,
  Globe
} from "lucide-react";
import { SystemHealthResponse } from "../types";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassStatus } from "../components/glass/GlassStatus";

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
    const s = typeof status === "string" ? status.toLowerCase() : status;
    if (s === "healthy" || s === "ok" || s === "connected" || s === "running" || s === true) {
      return "text-[#39D98A] bg-[#39D98A]/5 border-[#39D98A]/20";
    }
    if (s === "connecting" || s === "paused" || s === "degraded") {
      return "text-brand-amber bg-brand-amber/5 border-brand-amber/20";
    }
    return "text-eco-danger bg-eco-danger/5 border-eco-danger/20"; // offline / error
  };

  const getDotColor = (status: boolean | string | undefined) => {
    const s = typeof status === "string" ? status.toLowerCase() : status;
    if (s === "healthy" || s === "ok" || s === "connected" || s === "running" || s === true) {
      return "bg-[#39D98A] shadow-[0_0_8px_#39D98A]";
    }
    if (s === "connecting") {
      return "bg-brand-amber shadow-[0_0_8px_#FFB84D] animate-pulse";
    }
    if (s === "paused" || s === "degraded") {
      return "bg-brand-amber shadow-[0_0_8px_#FFB84D]";
    }
    return "bg-eco-danger shadow-[0_0_8px_#FF4D4D]"; // offline
  };

  const components = [
    {
      id: "api",
      name: "FastAPI REST Server",
      description: "Aggregates Pydantic simulation schemas and exposes endpoints for control overrides.",
      status: healthData?.components?.api || (readyData ? "healthy" : "offline"),
      icon: Cpu,
    },
    {
      id: "geocoding",
      name: "OpenStreetMap Geocoder",
      description: "Reverse geocodes GPS coordinates into localities, cities, and road corridors with memory caching.",
      status: healthData?.components?.geocoding || "healthy",
      icon: Globe,
    },
    {
      id: "db",
      name: "SQLite Database",
      description: "Stores historical simulation runs, step aggregate snapshots, and baseline compare histories.",
      status: healthData?.components?.database || "offline",
      icon: Database,
    },
    {
      id: "sumo",
      name: "SUMO Simulator",
      description: "Microscopic space-continuous traffic simulation engine (Eclipse SUMO).",
      status: healthData?.components?.sumo || wsState.sumoStatus,
      icon: Layers,
    },
    {
      id: "traci",
      name: "TraCI Connection API",
      description: "Python-SUMO interface APIs to mutate signal phases in real-time step callbacks.",
      status: healthData?.components?.traci || wsState.traciStatus,
      icon: Terminal,
    },
    {
      id: "ppo",
      name: "PPO Policy Neural Model",
      description: "Trained Proximal Policy Optimization reinforcement learning controller.",
      status: healthData?.components?.ppo || wsState.ppoStatus,
      icon: Activity,
    },
    {
      id: "ws",
      name: "WebSocket Streaming",
      description: "Event-loop stream pushing state telemetry frames from backend simulation steps.",
      status: wsState.connectionState === "connected" ? "healthy" : "offline",
      icon: Radio,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">System Diagnostics</h1>
          <p className="text-text-pale text-xs mt-1">
            Monitor diagnostics and connectivity for all services in the EcoTwin pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlassStatus label="SYSTEM READY" status={readyData ? "online" : "offline"} />
        </div>
      </div>

      {isLoadingHealth ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-44 bg-[#050505]/45 rounded-xl shimmer animate-pulse" />
          <div className="h-44 bg-[#050505]/45 rounded-xl shimmer animate-pulse" />
          <div className="h-44 bg-[#050505]/45 rounded-xl shimmer animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((c) => {
            const Icon = c.icon;
            const statusClass = getStatusColor(c.status);
            const dotClass = getDotColor(c.status);

            return (
              <GlassCard 
                key={c.id} 
                variant="status" 
                className="flex flex-col justify-between h-48 border border-[rgba(255,183,106,0.12)] font-mono text-xs"
              >
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[11px] font-bold text-text-cream uppercase tracking-wide">{c.name}</span>
                    <Icon className="h-4 w-4 text-text-muted" />
                  </div>
                  <p className="text-[11px] text-text-pale font-sans leading-relaxed mt-2.5 font-normal">
                    {c.description}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-[rgba(255,183,106,0.08)] pt-2.5 mt-4 text-[9px] uppercase tracking-widest font-bold">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                    <span>Diagnostics</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${statusClass}`}>
                    {c.status}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
