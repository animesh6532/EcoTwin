import React from "react";
import { ShieldAlert, CheckCircle2, PauseCircle, PlayCircle, RefreshCw } from "lucide-react";
import { GlassPanel } from "../glass/GlassPanel";

interface SimulationLifecycleBannerProps {
  simulationStatus: "OFFLINE" | "READY" | "RUNNING" | "PAUSED" | "FINISHED" | "ERROR";
  simulationTime: number;
  maxDuration?: number;
}

export const SimulationLifecycleBanner: React.FC<SimulationLifecycleBannerProps> = ({
  simulationStatus,
  simulationTime,
  maxDuration = 3600,
}) => {
  if (simulationStatus === "RUNNING") return null; // Clean active state

  if (simulationStatus === "PAUSED") {
    return (
      <GlassPanel className="p-4 bg-amber-500/10 border-amber-500/30 flex items-center justify-between font-mono text-xs text-amber-300">
        <div className="flex items-center gap-3">
          <PauseCircle className="h-5 w-5 text-amber-400 shrink-0 animate-pulse" />
          <div>
            <strong className="font-bold text-white uppercase block">SIMULATION PAUSED</strong>
            <span>SUMO simulation stepping is temporarily paused. Vehicle telemetry frozen at step {simulationTime.toFixed(1)}s.</span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">PAUSED</span>
      </GlassPanel>
    );
  }

  if (simulationStatus === "FINISHED") {
    return (
      <GlassPanel className="p-4 bg-emerald-500/10 border-emerald-500/30 flex items-center justify-between font-mono text-xs text-emerald-300">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="font-bold text-white uppercase block">SIMULATION FINISHED</strong>
            <span>SUMO has reached the maximum step limit of {maxDuration}s. Final network performance metrics captured.</span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">FINISHED</span>
      </GlassPanel>
    );
  }

  if (simulationStatus === "OFFLINE") {
    return (
      <GlassPanel className="p-4 bg-brand-orange/10 border-brand-orange/30 flex items-center justify-between font-mono text-xs text-text-cream">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-brand-orange shrink-0 animate-pulse" />
          <div>
            <strong className="font-bold text-brand-orange uppercase block">SIMULATION OFFLINE</strong>
            <span>No active SUMO session running. Click "Start Simulation" in the navigation controls to connect TraCI stream.</span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-orange/20 text-brand-orange font-bold uppercase">OFFLINE</span>
      </GlassPanel>
    );
  }

  return null;
};
