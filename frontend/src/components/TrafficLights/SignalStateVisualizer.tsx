import React from "react";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { TrafficLight, SignalStateMap } from "../../types";

interface SignalStateVisualizerProps {
  junction: TrafficLight | null;
}

export const SignalStateVisualizer: React.FC<SignalStateVisualizerProps> = ({ junction }) => {
  const signalState: SignalStateMap = junction?.signal_state || {
    north: "RED",
    south: "RED",
    east: "RED",
    west: "RED",
  };

  const getSignalBadge = (state: "GREEN" | "YELLOW" | "RED") => {
    switch (state) {
      case "GREEN":
        return {
          bg: "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
          dot: "bg-emerald-400 animate-pulse",
          text: "GREEN",
        };
      case "YELLOW":
        return {
          bg: "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
          dot: "bg-amber-400 animate-pulse",
          text: "YELLOW",
        };
      case "RED":
      default:
        return {
          bg: "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
          dot: "bg-rose-400",
          text: "RED",
        };
    }
  };

  const northBadge = getSignalBadge(signalState.north);
  const southBadge = getSignalBadge(signalState.south);
  const eastBadge = getSignalBadge(signalState.east);
  const westBadge = getSignalBadge(signalState.west);

  return (
    <div className="space-y-4 font-mono">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-orange" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            REAL-TIME INTERSECTION SIGNAL HEADS
          </h4>
        </div>
        <span className="text-[10px] text-text-pale">
          SUMO TraCI Live State
        </span>
      </div>

      {/* Crossroad Signal Visualizer Container */}
      <div className="relative w-full h-72 bg-[#090604] rounded-2xl border border-[rgba(255,184,77,0.16)] flex items-center justify-center overflow-hidden p-4">
        {/* Road intersection background lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Vertical road */}
          <div className="w-24 h-full bg-[#140F0A] border-x border-white/5 flex justify-center">
            <div className="w-0.5 h-full border-r border-dashed border-white/10" />
          </div>
          {/* Horizontal road */}
          <div className="absolute h-24 w-full bg-[#140F0A] border-y border-white/5 flex items-center">
            <div className="h-0.5 w-full border-b border-dashed border-white/10" />
          </div>
          {/* Center intersection node */}
          <div className="absolute w-24 h-24 bg-brand-orange/5 border border-brand-orange/20 rounded-lg flex items-center justify-center">
            <span className="text-[9px] font-bold text-brand-orange/60 uppercase">
              {junction?.id || "CENTER"}
            </span>
          </div>
        </div>

        {/* NORTH APPROACH HEAD */}
        <div className="absolute top-3 flex flex-col items-center gap-1 z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-pale">
            <span>NORTH</span>
            <ArrowDown className="h-3 w-3 text-text-muted" />
          </div>
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-bold ${northBadge.bg}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${northBadge.dot}`} />
            <span>[ {northBadge.text} ]</span>
          </div>
        </div>

        {/* SOUTH APPROACH HEAD */}
        <div className="absolute bottom-3 flex flex-col items-center gap-1 z-10">
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-bold ${southBadge.bg}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${southBadge.dot}`} />
            <span>[ {southBadge.text} ]</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-pale">
            <ArrowUp className="h-3 w-3 text-text-muted" />
            <span>SOUTH</span>
          </div>
        </div>

        {/* WEST APPROACH HEAD */}
        <div className="absolute left-4 flex items-center gap-2 z-10">
          <div className="flex flex-col items-start gap-0.5 text-[10px] font-bold text-text-pale">
            <span>WEST</span>
            <ArrowRight className="h-3 w-3 text-text-muted" />
          </div>
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-bold ${westBadge.bg}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${westBadge.dot}`} />
            <span>[ {westBadge.text} ]</span>
          </div>
        </div>

        {/* EAST APPROACH HEAD */}
        <div className="absolute right-4 flex items-center gap-2 z-10">
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-bold ${eastBadge.bg}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${eastBadge.dot}`} />
            <span>[ {eastBadge.text} ]</span>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-[10px] font-bold text-text-pale">
            <span>EAST</span>
            <ArrowLeft className="h-3 w-3 text-text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};
