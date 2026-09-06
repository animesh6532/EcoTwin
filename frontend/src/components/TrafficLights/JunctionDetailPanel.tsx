import React from "react";
import { Cpu, Clock, ChevronRight, Layers, Navigation } from "lucide-react";
import { TrafficLight } from "../../types";

interface JunctionDetailPanelProps {
  junction: TrafficLight | null;
  controllerMode: string;
}

export const JunctionDetailPanel: React.FC<JunctionDetailPanelProps> = ({
  junction,
  controllerMode,
}) => {
  if (!junction) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-[rgba(255,183,106,0.12)] rounded-xl space-y-2 font-mono">
        <Navigation className="h-8 w-8 text-text-muted/40 mb-1 animate-pulse" />
        <span>Select a discovered traffic light junction from the network list to inspect live details.</span>
      </div>
    );
  }

  const statusColor =
    junction.status === "CRITICAL"
      ? "text-red-400 bg-red-500/10 border-red-500/30"
      : junction.status === "WARNING"
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-eco-success bg-eco-success/10 border-eco-success/30";

  return (
    <div className="space-y-6">
      {/* Junction Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[rgba(255,183,106,0.12)] gap-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-sans text-text-cream tracking-wide">
              JUNCTION: {junction.id}
            </h2>
            <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold uppercase border ${statusColor}`}>
              {junction.status || "ACTIVE"}
            </span>
          </div>
          <p className="text-xs text-text-pale mt-1">Microscopic traffic signal program and approach performance telemetry</p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-text-pale font-mono">
          <Cpu className="h-4 w-4 text-brand-orange" />
          <span>CONTROLLER: <strong className="text-brand-orange uppercase">{controllerMode}</strong></span>
        </div>
      </div>

      {/* Live Phase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Current Phase */}
        <div className="p-4 rounded-xl bg-brand-orange/10 border border-brand-orange/30 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] text-text-muted uppercase font-bold">
            <span>CURRENT PHASE</span>
            <span className="px-1.5 py-0.5 bg-brand-orange/20 text-brand-orange rounded text-[9px]">LIVE</span>
          </div>
          <div className="text-sm font-bold text-text-cream truncate">
            Phase {junction.active_phase}
          </div>
          <div className="text-[11px] text-brand-orange font-sans leading-tight font-medium">
            {junction.active_phase_name || `Phase ${junction.active_phase}`}
          </div>
        </div>

        {/* Time Remaining Countdown */}
        <div className="p-4 rounded-xl bg-[#120D09]/50 border border-[rgba(255,184,77,0.16)] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-text-muted uppercase font-bold">
            <span>TIME REMAINING</span>
            <Clock className="h-3.5 w-3.5 text-brand-orange animate-spin-slow" />
          </div>
          <div className="text-2xl font-bold text-text-cream">
            {(junction.remaining_sec ?? 0).toFixed(1)} <span className="text-xs text-text-pale font-normal">sec</span>
          </div>
          <div className="text-[10px] text-text-pale">
            Elapsed: {(junction.elapsed_sec ?? 0).toFixed(1)}s / Cycle: {junction.cycle_duration ?? 90}s
          </div>
        </div>

        {/* Next Phase */}
        <div className="p-4 rounded-xl bg-[#120D09]/50 border border-[rgba(255,184,77,0.16)] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-text-muted uppercase font-bold">
            <span>NEXT TRANSITION</span>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
          </div>
          <div className="text-sm font-bold text-text-cream truncate">
            Phase {junction.next_phase ?? (junction.active_phase + 1) % 4}
          </div>
          <div className="text-[11px] text-text-pale font-sans truncate">
            {junction.next_phase_name || `Phase ${junction.next_phase}`}
          </div>
        </div>

        {/* Approach Performance */}
        <div className="p-4 rounded-xl bg-[#120D09]/50 border border-[rgba(255,184,77,0.16)] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-text-muted uppercase font-bold">
            <span>TOTAL QUEUE / DELAY</span>
            <Layers className="h-3.5 w-3.5 text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text-cream">
            {junction.total_queue ?? 0} <span className="text-xs text-text-pale font-normal">veh</span>
          </div>
          <div className="text-[10px] text-text-pale">
            Avg Delay: {(junction.average_delay ?? 0).toFixed(1)} sec/veh
          </div>
        </div>
      </div>
    </div>
  );
};
