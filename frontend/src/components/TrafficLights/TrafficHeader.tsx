import React from "react";
import { Activity, ShieldAlert, Cpu, Radio, Database, Server } from "lucide-react";
import { GlassStatus } from "../glass/GlassStatus";

interface TrafficHeaderProps {
  controllerMode: string;
  simulationStatus: string;
  isWsConnected: boolean;
  systemHealth: {
    api: string;
    sumo: string;
    traci: string;
    ppo: string;
  };
}

export const TrafficHeader: React.FC<TrafficHeaderProps> = ({
  controllerMode,
  simulationStatus,
  isWsConnected,
  systemHealth,
}) => {
  const getControllerLabel = () => {
    if (simulationStatus === "OFFLINE") return "SIMULATION OFFLINE";
    if (simulationStatus === "PAUSED") return "SIMULATION PAUSED";
    if (simulationStatus === "FINISHED") return "SIMULATION FINISHED";
    if (controllerMode === "ppo") return "PPO RL ACTIVE";
    return "FIXED-TIME BASELINE";
  };

  const getControllerStatusType = () => {
    if (simulationStatus === "OFFLINE" || simulationStatus === "FINISHED") return "stopped";
    if (simulationStatus === "PAUSED") return "warning";
    if (controllerMode === "ppo") return "running";
    return "running";
  };

  const getPillColor = (state: string) => {
    if (state === "healthy") return "text-eco-success bg-eco-success/10 border-eco-success/20";
    if (state === "active") return "text-brand-orange bg-brand-orange/10 border-brand-orange/20";
    return "text-text-muted bg-white/5 border-white/10";
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,183,106,0.12)]">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-sans text-text-cream">
              Traffic Network Control
            </h1>
            <p className="text-text-pale text-xs mt-0.5">
              Monitor live junction conditions, signal phases, congestion, and intelligent traffic-control decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* System Health Badges */}
        <div className="flex items-center gap-2 bg-[#120D09]/60 px-3 py-1.5 rounded-xl border border-[rgba(255,184,77,0.16)] text-[10px] font-mono">
          <span className="text-text-muted font-bold tracking-widest uppercase mr-1 flex items-center gap-1">
            <Server className="h-3 w-3" /> API:
          </span>
          <span className={`px-2 py-0.5 rounded border uppercase font-bold ${getPillColor(systemHealth.api)}`}>
            {systemHealth.api}
          </span>

          <span className="text-text-muted font-bold tracking-widest uppercase ml-2 mr-1 flex items-center gap-1">
            <Database className="h-3 w-3" /> SUMO:
          </span>
          <span className={`px-2 py-0.5 rounded border uppercase font-bold ${getPillColor(systemHealth.sumo)}`}>
            {systemHealth.sumo}
          </span>

          <span className="text-text-muted font-bold tracking-widest uppercase ml-2 mr-1 flex items-center gap-1">
            <Radio className="h-3 w-3" /> TraCI:
          </span>
          <span className={`px-2 py-0.5 rounded border uppercase font-bold ${getPillColor(systemHealth.traci)}`}>
            {systemHealth.traci}
          </span>

          <span className="text-text-muted font-bold tracking-widest uppercase ml-2 mr-1 flex items-center gap-1">
            <Cpu className="h-3 w-3" /> PPO:
          </span>
          <span className={`px-2 py-0.5 rounded border uppercase font-bold ${getPillColor(systemHealth.ppo)}`}>
            {systemHealth.ppo}
          </span>

          <span className="text-text-muted font-bold tracking-widest uppercase ml-2 mr-1 flex items-center gap-1">
            WS:
          </span>
          <span
            className={`px-2 py-0.5 rounded border uppercase font-bold ${
              isWsConnected
                ? "text-eco-success bg-eco-success/10 border-eco-success/20"
                : "text-brand-orange bg-brand-orange/10 border-brand-orange/20"
            }`}
          >
            {isWsConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>

        {/* Controller Status Badge */}
        <GlassStatus label="CONTROLLER MODE" status={getControllerLabel()} type={getControllerStatusType()} />
      </div>
    </div>
  );
};
