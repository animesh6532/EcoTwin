import React from "react";
import { Activity, Radio } from "lucide-react";

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
  const isRunning = simulationStatus === "ACTIVE RUN" || simulationStatus === "RUNNING";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[rgba(255,183,106,0.12)]">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-orange/10 border border-brand-orange/25 text-brand-orange shrink-0">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase font-sans text-text-cream leading-tight">
            Traffic Network Control
          </h1>
          <p className="text-text-pale text-xs mt-0.5 leading-none">
            Monitor live junction conditions, signal phases, congestion, and intelligent traffic-control decisions.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
        {/* System State Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold uppercase ${
          isRunning 
            ? "text-brand-orange bg-brand-orange/10 border-brand-orange/30 shadow-[0_0_10px_rgba(255,138,0,0.15)] animate-pulse"
            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        }`}>
          <span className="text-text-muted">SYSTEM STATE:</span>
          <span>{isRunning ? "ACTIVE RUN" : "SYSTEM IDLE"}</span>
        </div>

        {/* SUMO Status Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold uppercase ${
          systemHealth.sumo === "healthy" || isRunning
            ? "text-eco-success bg-eco-success/10 border-eco-success/20"
            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}>
          <span className="text-text-muted">SUMO:</span>
          <span>{systemHealth.sumo === "healthy" || isRunning ? "CONNECTED" : "UNAVAILABLE"}</span>
        </div>

        {/* Controller Mode Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-bold uppercase text-text-cream">
          <span className="text-text-muted">CONTROLLER:</span>
          <span className={controllerMode === "ppo" ? "text-brand-orange" : "text-text-cream"}>
            {controllerMode === "ppo" ? "PPO AGENT" : "FIXED-TIME"}
          </span>
        </div>

        {/* WS Stream Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold uppercase ${
          isWsConnected
            ? "text-eco-success bg-eco-success/10 border-eco-success/20"
            : "text-brand-orange bg-brand-orange/10 border-brand-orange/20"
        }`}>
          <Radio className="h-3 w-3" />
          <span>{isWsConnected ? "STREAM LIVE" : "IDLE"}</span>
        </div>
      </div>
    </div>
  );
};


