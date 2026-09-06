import React from "react";
import { GitFork, Activity, ShieldAlert } from "lucide-react";
import { GlassPanel } from "../glass/GlassPanel";
import { TrafficLight } from "../../types";

interface JunctionListProps {
  junctions: TrafficLight[];
  selectedJunctionId: string | null;
  onSelectJunction: (id: string) => void;
  isLoading: boolean;
  isRunning: boolean;
  controllerMode: string;
}

export const JunctionList: React.FC<JunctionListProps> = ({
  junctions,
  selectedJunctionId,
  onSelectJunction,
  isLoading,
  isRunning,
  controllerMode,
}) => {
  return (
    <GlassPanel className="p-5 space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center pb-3 border-b border-[rgba(255,183,106,0.12)] mb-4">
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4 text-brand-orange" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-cream">
              DISCOVERED JUNCTIONS ({junctions.length})
            </h3>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-white/5 border border-white/10 text-text-muted">
            SUMO NETWORK
          </span>
        </div>

        {!isRunning ? (
          <div className="py-8 text-center px-4 space-y-3 border border-dashed border-[rgba(255,183,106,0.15)] rounded-xl bg-[#120D09]/40 font-mono text-xs text-text-muted">
            <ShieldAlert className="h-8 w-8 text-brand-orange/60 mx-auto animate-pulse" />
            <p className="text-text-pale text-[11px] leading-relaxed">
              Discovered traffic light junctions are only available while the SUMO environment is actively running.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-[#120D09]/60 rounded-xl shimmer animate-pulse" />
            <div className="h-16 bg-[#120D09]/60 rounded-xl shimmer animate-pulse" />
          </div>
        ) : junctions.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {junctions.map((j) => {
              const isSelected = selectedJunctionId === j.id;
              const statusColor =
                j.status === "CRITICAL"
                  ? "text-red-400 bg-red-500/10 border-red-500/30"
                  : j.status === "WARNING"
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                  : "text-eco-success bg-eco-success/10 border-eco-success/30";

              return (
                <button
                  key={j.id}
                  onClick={() => onSelectJunction(j.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-mono flex flex-col gap-2 relative ${
                    isSelected
                      ? "bg-brand-orange/15 border-brand-orange text-white shadow-[0_0_20px_rgba(255,138,0,0.1)]"
                      : "bg-[#120D09]/50 border-[rgba(255,184,77,0.16)] text-[#FFF7ED] hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Activity className="h-4 w-4 text-brand-orange" />
                      <span>Junction {j.id}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${statusColor}`}>
                      {j.status || "ACTIVE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-text-pale pt-1 border-t border-white/5">
                    <div>
                      <span>Vehicles: </span>
                      <strong className="text-text-cream">{j.total_vehicles ?? 0}</strong>
                    </div>
                    <div>
                      <span>Queue: </span>
                      <strong className="text-text-cream">{j.total_queue ?? 0}</strong>
                    </div>
                    <div className="col-span-2 truncate">
                      <span>Phase: </span>
                      <strong className="text-brand-orange">{j.active_phase_name || `Phase ${j.active_phase}`}</strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-xl font-mono">
            No active traffic light junctions discovered in SUMO network.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[rgba(255,183,106,0.12)] text-[10px] font-mono text-text-muted flex justify-between">
        <span>CONTROLLER:</span>
        <span className="text-brand-orange uppercase font-bold">{controllerMode}</span>
      </div>
    </GlassPanel>
  );
};
