import React from "react";
import { ArrowUpRight, Car, Layers, Gauge, Clock } from "lucide-react";
import { DirectionApproachMetrics } from "../../types";

interface TrafficFlowPanelProps {
  approaches?: DirectionApproachMetrics[];
  isRunning: boolean;
}

export const TrafficFlowPanel: React.FC<TrafficFlowPanelProps> = ({ approaches, isRunning }) => {
  if (!approaches || approaches.length === 0 || !isRunning) {
    return (
      <div className="p-6 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-xl font-mono">
        Approach traffic flow telemetry unavailable (Simulation is offline or junction not selected).
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-brand-orange" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            APPROACH TRAFFIC FLOW BREAKDOWN
          </h4>
        </div>
        <span className="text-[10px] text-text-pale">Microscopic Lane Dynamics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {approaches.map((app) => (
          <div
            key={app.direction}
            className="p-4 rounded-xl bg-[#120D09]/50 border border-[rgba(255,184,77,0.16)] space-y-3 relative overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-bold text-xs text-brand-orange uppercase">
                {app.direction} APPROACH
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-text-pale">
                {app.incoming_lanes?.join(", ")}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-text-pale">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Car className="h-3.5 w-3.5 text-text-muted" /> Approaching:
                </span>
                <strong className="text-text-cream">{app.vehicles_approaching} veh</strong>
              </div>

              <div className="flex justify-between items-center text-text-pale">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Layers className="h-3.5 w-3.5 text-amber-400" /> Queue Length:
                </span>
                <strong className="text-amber-300">{app.queue_length} veh</strong>
              </div>

              <div className="flex justify-between items-center text-text-pale">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Gauge className="h-3.5 w-3.5 text-emerald-400" /> Mean Speed:
                </span>
                <strong className="text-emerald-300">{app.average_speed.toFixed(1)} km/h</strong>
              </div>

              <div className="flex justify-between items-center text-text-pale">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" /> Est Delay:
                </span>
                <strong className="text-cyan-300">{app.estimated_delay.toFixed(1)} s</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
