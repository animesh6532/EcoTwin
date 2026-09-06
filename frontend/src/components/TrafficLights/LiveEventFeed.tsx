import React from "react";
import { Activity, Clock, Cpu, GitFork, AlertTriangle } from "lucide-react";

export interface LogEvent {
  id: string;
  timestamp: string;
  junctionId: string;
  type: "PHASE_CHANGE" | "QUEUE_ALERT" | "PPO_ACTION" | "SUMO_STEP" | "SYSTEM";
  message: string;
  detail?: string;
}

interface LiveEventFeedProps {
  events: LogEvent[];
  isRunning: boolean;
}

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ events, isRunning }) => {
  const getEventIcon = (type: LogEvent["type"]) => {
    switch (type) {
      case "PHASE_CHANGE":
        return <GitFork className="h-3.5 w-3.5 text-brand-orange" />;
      case "QUEUE_ALERT":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case "PPO_ACTION":
        return <Cpu className="h-3.5 w-3.5 text-eco-cyan" />;
      case "SUMO_STEP":
        return <Activity className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-3 font-mono">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-orange animate-pulse" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            LIVE OPERATIONAL EVENT FEED
          </h4>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-white/5 border border-white/10 text-text-pale">
          {isRunning ? "STREAMING REAL-TIME" : "FEED IDLE"}
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {events && events.length > 0 ? (
          events.slice(0, 8).map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-xl bg-[#120D09]/60 border border-[rgba(255,184,77,0.14)] flex items-start gap-2.5 text-xs transition-all hover:border-[rgba(255,184,77,0.3)]"
            >
              <div className="p-1 rounded-lg bg-white/5 shrink-0 mt-0.5">
                {getEventIcon(evt.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] text-text-cream truncate">
                    {evt.junctionId ? `Junction ${evt.junctionId}` : "System Event"}
                  </span>
                  <span className="text-[9px] text-text-muted shrink-0">{evt.timestamp}</span>
                </div>
                <p className="text-[11px] text-text-pale mt-0.5 leading-snug">{evt.message}</p>
                {evt.detail && (
                  <span className="text-[9px] text-brand-amber font-mono mt-0.5 block">
                    {evt.detail}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-text-muted border border-dashed border-white/10 rounded-xl">
            {isRunning ? "Listening for live traffic operational events..." : "NO RECENT EVENTS (Simulation Offline)"}
          </div>
        )}
      </div>
    </div>
  );
};
