import React from "react";
import { Clock, Play } from "lucide-react";
import { TrafficLight, SignalPhaseDetail } from "../../types";

interface PhaseTimelineProps {
  junction: TrafficLight | null;
}

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ junction }) => {
  if (!junction || !junction.phase_details || junction.phase_details.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-xl font-mono">
        No phase timeline data available for selected junction.
      </div>
    );
  }

  const phases = junction.phase_details;
  const cycleDuration = junction.cycle_duration || sumPhases(phases) || 90;
  const activeIndex = junction.active_phase ?? 0;
  const remainingSec = junction.remaining_sec ?? 0;

  function sumPhases(pList: SignalPhaseDetail[]) {
    return pList.reduce((acc, p) => acc + (p.duration || 0), 0);
  }

  // Calculate cumulative timeline offsets
  let cumulative = 0;
  const timelineItems = phases.map((p) => {
    const start = cumulative;
    cumulative += p.duration;
    const end = cumulative;
    const widthPct = (p.duration / cycleDuration) * 100;
    return {
      ...p,
      start,
      end,
      widthPct,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-orange" />
          <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-text-cream">
            SIGNAL PHASE TIMELINE (CYCLE DURATION: {cycleDuration}s)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-pale">
          <Play className="h-3 w-3 text-eco-success fill-eco-success" />
          <span>Active Phase: <strong className="text-brand-orange">Index {activeIndex} ({junction.active_phase_name})</strong></span>
        </div>
      </div>

      {/* Graphical Timeline Bar */}
      <div className="space-y-3 font-mono">
        <div className="w-full bg-[#120D09] rounded-xl p-3 border border-[rgba(255,184,77,0.16)] space-y-2">
          {/* Timeline axis ticks */}
          <div className="flex justify-between text-[9px] text-text-muted px-1">
            {timelineItems.map((item, idx) => (
              <span key={idx}>
                {Math.round(item.start)}s
              </span>
            ))}
            <span>{Math.round(cycleDuration)}s</span>
          </div>

          {/* Combined Progress Bar */}
          <div className="h-8 w-full bg-black/40 rounded-lg flex overflow-hidden p-1 gap-1 border border-white/5 relative">
            {timelineItems.map((item, idx) => {
              const isActive = item.index === activeIndex;
              const isGreen = item.state_pattern.includes("G") || item.state_pattern.includes("g");
              const isYellow = item.state_pattern.includes("y") || item.state_pattern.includes("Y");

              let bgColor = "bg-rose-950/60 border-rose-500/30 text-rose-300";
              if (isGreen) bgColor = "bg-emerald-950/70 border-emerald-500/40 text-emerald-300";
              if (isYellow) bgColor = "bg-amber-950/70 border-amber-500/40 text-amber-300";

              return (
                <div
                  key={idx}
                  style={{ width: `${item.widthPct}%` }}
                  className={`h-full rounded flex items-center justify-between px-2 text-[10px] border transition-all relative ${bgColor} ${
                    isActive ? "ring-2 ring-brand-orange shadow-[0_0_15px_rgba(255,138,0,0.4)]" : "opacity-75"
                  }`}
                  title={`${item.name} (${item.duration}s)`}
                >
                  <span className="font-bold truncate text-[9px]">P{item.index}</span>
                  <span className="text-[8px] opacity-80">{item.duration}s</span>

                  {isActive && (
                    <div
                      className="absolute inset-0 bg-brand-orange/20 animate-pulse pointer-events-none rounded"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Breakdown Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {timelineItems.map((item) => {
            const isActive = item.index === activeIndex;
            const isGreen = item.state_pattern.includes("G") || item.state_pattern.includes("g");
            const isYellow = item.state_pattern.includes("y") || item.state_pattern.includes("Y");

            let badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
            if (isGreen) badgeColor = "bg-eco-success/10 text-eco-success border-eco-success/20";
            if (isYellow) badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";

            return (
              <div
                key={item.index}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isActive
                    ? "bg-brand-orange/10 border-brand-orange text-white shadow-[0_0_15px_rgba(255,138,0,0.06)]"
                    : "bg-[#120D09]/40 border-[rgba(255,184,77,0.12)] text-text-pale"
                }`}
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-text-cream">Phase {item.index}</span>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded border uppercase font-bold ${badgeColor}`}>
                      {isGreen ? "GREEN" : isYellow ? "YELLOW" : "RED"}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-pale truncate font-sans">{item.name}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-text-cream">{item.duration}s</span>
                  {isActive && (
                    <div className="text-[9px] text-brand-orange font-bold flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="h-3 w-3 animate-spin" />
                      <span>{remainingSec.toFixed(1)}s left</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
