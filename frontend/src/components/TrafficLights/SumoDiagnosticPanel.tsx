import React from "react";
import { Server, CheckCircle, AlertTriangle } from "lucide-react";

interface SumoDiagnosticPanelProps {
  sumoStatus: string;
  traciStatus: string;
  ppoStatus: string;
  connectionState: string;
  simulationTime: number;
  vehicleCount: number;
  isRunning: boolean;
}

export const SumoDiagnosticPanel: React.FC<SumoDiagnosticPanelProps> = ({
  sumoStatus,
  traciStatus,
  ppoStatus,
  connectionState,
  simulationTime,
  vehicleCount,
  isRunning,
}) => {
  const isHealthy = sumoStatus === "healthy" || isRunning;

  return (
    <div className="p-4 rounded-2xl bg-[#120D09]/60 border border-[rgba(255,184,77,0.16)] font-mono text-xs space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-brand-orange" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            SUMO SIMULATOR DIAGNOSTIC ENGINE
          </h4>
        </div>
        <span
          className={`text-[8.5px] px-2 py-0.5 rounded font-bold uppercase border flex items-center gap-1 ${
            isHealthy
              ? "text-eco-success bg-eco-success/10 border-eco-success/20"
              : "text-rose-400 bg-rose-500/10 border-rose-500/20"
          }`}
        >
          {isHealthy ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {isHealthy ? "SUMO CONNECTED" : "SUMO UNAVAILABLE"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10.5px]">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-text-muted text-[9px] block">CONFIG FILE</span>
          <strong className="text-text-cream block truncate">city.sumocfg</strong>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-text-muted text-[9px] block">SIMULATION TIME</span>
          <strong className="text-brand-orange block font-mono">
            {simulationTime.toFixed(1)} s
          </strong>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-text-muted text-[9px] block">PPO AGENT ENGINE</span>
          <strong
            className={`block font-mono text-[9.5px] uppercase ${
              ppoStatus === "healthy" || ppoStatus === "active" ? "text-eco-success" : "text-brand-orange"
            }`}
          >
            {ppoStatus === "healthy" || ppoStatus === "active" ? "MODEL READY" : "STANDBY"}
          </strong>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-text-muted text-[9px] block">NETWORK VEHICLES</span>
          <strong className="text-emerald-400 block font-mono">
            {isRunning ? vehicleCount : 0} active
          </strong>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-text-muted text-[9px] block">TRACI SOCKET</span>
          <strong
            className={`block font-mono text-[9.5px] uppercase ${
              traciStatus === "healthy" ? "text-eco-success" : "text-amber-400"
            }`}
          >
            {traciStatus === "healthy" ? "CONNECTED" : "DISCONNECTED"}
          </strong>
        </div>

        <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-text-muted text-[9px] block">WEBSOCKET CHANNEL</span>
          <strong
            className={`block font-mono text-[9.5px] uppercase ${
              connectionState === "connected" ? "text-eco-success" : "text-amber-400"
            }`}
          >
            {connectionState === "connected" ? "STREAMING" : "IDLE"}
          </strong>
        </div>
      </div>
    </div>
  );
};

