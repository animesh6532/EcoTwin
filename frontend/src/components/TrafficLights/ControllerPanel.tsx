import React from "react";
import { Cpu, Zap, Activity, CheckCircle, AlertTriangle } from "lucide-react";
import { GlassButton } from "../glass/GlassButton";

interface ControllerPanelProps {
  currentController: string; // "fixed_time" | "ppo"
  ppoStatusStr: string;
  ppoReward: number;
  ppoLatencyMs: number;
  onSwitchController: (mode: "fixed_time" | "ppo") => void;
  isSwitching: boolean;
  isRunning: boolean;
}

export const ControllerPanel: React.FC<ControllerPanelProps> = ({
  currentController,
  ppoStatusStr,
  ppoReward,
  ppoLatencyMs,
  onSwitchController,
  isSwitching,
  isRunning,
}) => {
  const isPpoActive = currentController === "ppo";

  return (
    <div className="space-y-4 font-mono">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-brand-orange" />
          <h4 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            SIGNAL CONTROLLER ARCHITECTURE
          </h4>
        </div>
        <span
          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
            isPpoActive
              ? "text-brand-orange bg-brand-orange/10 border-brand-orange/30"
              : "text-text-muted bg-white/5 border-white/10"
          }`}
        >
          {isPpoActive ? "PPO RL OPTIMIZER" : "FIXED-TIME CYCLE"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Controller Mode Selector */}
        <div className="p-4 rounded-xl bg-[#120D09]/50 border border-[rgba(255,184,77,0.16)] space-y-3">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block">
            SELECT ACTIVE CONTROLLER
          </span>

          <div className="flex gap-2">
            <GlassButton
              onClick={() => onSwitchController("fixed_time")}
              variant={!isPpoActive ? "primary" : "secondary"}
              size="sm"
              disabled={isSwitching || !isRunning}
              className="w-full text-[10px]"
            >
              FIXED-TIME BASELINE
            </GlassButton>

            <GlassButton
              onClick={() => onSwitchController("ppo")}
              variant={isPpoActive ? "primary" : "secondary"}
              size="sm"
              disabled={isSwitching || !isRunning}
              className="w-full text-[10px]"
            >
              PPO / RL OPTIMIZER
            </GlassButton>
          </div>

          <p className="text-[10px] text-text-pale leading-relaxed font-sans">
            {isPpoActive
              ? "PPO reinforcement learning model dynamically adjusts signal phase split based on real-time vehicle queue vectors."
              : "Fixed-time pre-timed signal logic executes standard static phase durations (42s Green / 3s Yellow)."}
          </p>
        </div>

        {/* PPO RL Telemetry Panel */}
        <div
          className={`p-4 rounded-xl border space-y-3 ${
            isPpoActive
              ? "bg-brand-orange/5 border-brand-orange/30"
              : "bg-[#120D09]/50 border-[rgba(255,184,77,0.16)] opacity-80"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase">
              <Zap className="h-3.5 w-3.5 text-brand-orange" />
              <span>PPO MODEL STATUS</span>
            </div>
            <span
              className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                isPpoActive
                  ? "text-eco-success bg-eco-success/10 border border-eco-success/20"
                  : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              }`}
            >
              {isPpoActive ? "PPO ACTIVE" : ppoStatusStr || "PPO READY"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-black/30 border border-white/5 space-y-0.5">
              <span className="text-[9px] text-text-muted">REWARD:</span>
              <div className="font-bold text-text-cream">
                {isRunning ? ppoReward.toFixed(3) : "DATA UNAVAILABLE"}
              </div>
            </div>

            <div className="p-2 rounded bg-black/30 border border-white/5 space-y-0.5">
              <span className="text-[9px] text-text-muted">INFERENCE LATENCY:</span>
              <div className="font-bold text-text-cream">
                {isRunning ? `${ppoLatencyMs.toFixed(1)} ms` : "DATA UNAVAILABLE"}
              </div>
            </div>
          </div>

          <div className="text-[9px] text-text-pale flex items-center gap-1.5 pt-1">
            <CheckCircle className="h-3.5 w-3.5 text-eco-success shrink-0" />
            <span>Policy network: 8D state vector → 4D discrete action space</span>
          </div>
        </div>
      </div>
    </div>
  );
};
