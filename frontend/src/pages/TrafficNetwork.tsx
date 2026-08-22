import { useQuery, useMutation } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getTrafficLights, getTrafficLightDetail, setTrafficLightAction } from "../api/trafficLights";
import { useState } from "react";
import { GitFork, CheckCircle, Clock, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "../utils/toast";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassStatus } from "../components/glass/GlassStatus";
import { GlassModal } from "../components/glass/GlassModal";

interface ActionLog {
  junctionId: string;
  phase: number;
  timestamp: string;
  status: "success" | "failed";
}

export default function TrafficNetwork() {
  const wsState = useSimulationStore();
  const { data: tlIds, isLoading } = useQuery({
    queryKey: ["trafficLightsList"],
    queryFn: getTrafficLights,
    enabled: wsState.running,
  });

  const [selectedJunctionId, setSelectedJunctionId] = useState<string | null>(null);
  const [confirmPhase, setConfirmPhase] = useState<{ junctionId: string; phaseIndex: number } | null>(null);
  const [actionHistory, setActionHistory] = useState<ActionLog[]>([]);

  // Selected Junction Details query
  const { data: tlDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["trafficLightDetail", selectedJunctionId],
    queryFn: () => getTrafficLightDetail(selectedJunctionId!),
    enabled: !!selectedJunctionId && wsState.running,
  });

  // Action mutation
  const applyActionMutation = useMutation({
    mutationFn: ({ junctionId, phaseIndex }: { junctionId: string; phaseIndex: number }) =>
      setTrafficLightAction(junctionId, phaseIndex),
    onSuccess: (_, variables) => {
      setActionHistory((prev) => [
        {
          junctionId: variables.junctionId,
          phase: variables.phaseIndex,
          timestamp: new Date().toLocaleTimeString(),
          status: "success",
        },
        ...prev,
      ]);
      toast(`Manual phase ${variables.phaseIndex} applied successfully to ${variables.junctionId}.`, "success");
    },
    onError: (err: any, variables) => {
      setActionHistory((prev) => [
        {
          junctionId: variables.junctionId,
          phase: variables.phaseIndex,
          timestamp: new Date().toLocaleTimeString(),
          status: "failed",
        },
        ...prev,
      ]);
      toast(err.message || "Failed to apply manual phase action.", "error");
    },
  });

  const handleApplyAction = (junctionId: string, phaseIndex: number) => {
    setConfirmPhase({ junctionId, phaseIndex });
  };

  const executeAction = () => {
    if (!confirmPhase) return;
    applyActionMutation.mutate(confirmPhase);
    setConfirmPhase(null);
  };

  const getPhaseDescription = (index: number) => {
    switch (index) {
      case 0:
        return "North-South Green (East-West Red)";
      case 1:
        return "North-South Yellow transition";
      case 2:
        return "East-West Green (North-South Red)";
      case 3:
        return "East-West Yellow transition";
      default:
        return "Unknown Phase";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Traffic Network Control</h1>
          <p className="text-text-pale text-xs mt-1">
            Perform manual signal override and monitor microscopic phase configuration states.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GlassStatus label="CONTROLLER MODE" status={wsState.controller === "ppo" ? "PPO RL ACTIVE" : "FIXED-TIME CYCLE"} />
        </div>
      </div>

      {!wsState.running ? (
        <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
          <GlassPanel className="max-w-xl w-full text-center space-y-6">
            <ShieldAlert className="h-10 w-10 text-brand-orange mx-auto animate-pulse" />
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-text-cream tracking-widest uppercase font-mono">
                SIMULATION INACTIVE
              </h3>
              <p className="text-text-pale text-xs leading-relaxed max-w-sm mx-auto">
                Discovered traffic light junctions are only available while the SUMO environment is actively running. Start a SUMO session to inspect control systems.
              </p>
            </div>
          </GlassPanel>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Discovered Junctions list */}
          <GlassPanel className="p-6">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted mb-4 border-b border-[rgba(255,183,106,0.12)] pb-3">Discovered Junctions</h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-[#050505]/45 rounded-lg shimmer animate-pulse" />
                <div className="h-12 bg-[#050505]/45 rounded-lg shimmer animate-pulse" />
              </div>
            ) : tlIds && tlIds.length > 0 ? (
              <div className="space-y-2">
                {tlIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedJunctionId(id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-mono font-bold flex justify-between items-center ${
                      selectedJunctionId === id
                        ? "bg-brand-orange/10 border-brand-orange text-white"
                        : "bg-[#050505]/45 border-[rgba(255,183,106,0.12)] text-text-cream hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-text-muted" />
                      <span>ID: {id}</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${wsState.controller === "ppo" ? "text-brand-orange bg-brand-orange/10" : "text-text-muted bg-white/5"}`}>
                      {wsState.controller === "ppo" ? "PPO" : "FIXED"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                No active traffic light junctions found.
              </div>
            )}
          </GlassPanel>

          {/* Selected Junction Details (Inspector & overrides) */}
          <GlassPanel className="lg:col-span-2 p-6 space-y-6">
            {selectedJunctionId ? (
              <>
                <div className="flex justify-between items-start pb-4 border-b border-[rgba(255,183,106,0.12)]">
                  <div>
                    <h3 className="font-bold text-text-cream text-base font-sans tracking-wide">Junction Override: {selectedJunctionId}</h3>
                    <p className="text-xs text-text-pale mt-0.5">Control configurations and phase selector</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-pale font-mono tracking-wider">
                    <Cpu className="h-4 w-4 text-text-muted" />
                    <span>MODE: {wsState.controller === "ppo" ? "PPO RL OPTIMIZATION" : "FIXED-TIME BASELINE"}</span>
                  </div>
                </div>

                {isLoadingDetail ? (
                  <div className="h-40 bg-[#050505]/45 rounded-xl shimmer animate-pulse" />
                ) : tlDetail ? (
                  <div className="space-y-6">
                    {/* Phase Override selection */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">Select Manual Phase State</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tlDetail.phases.map((pattern, index) => {
                          const isCurrent = tlDetail.active_phase === index;
                          return (
                            <div 
                              key={index} 
                              className={`p-4 rounded-xl border flex flex-col justify-between h-36 font-mono ${
                                isCurrent 
                                  ? "bg-brand-orange/5 border-brand-orange/45 shadow-[0_0_15px_rgba(255,138,0,0.06)]" 
                                  : "bg-[#050505]/45 border-[rgba(255,183,106,0.12)]"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-text-cream text-xs">Phase Index {index}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 bg-brand-orange/15 text-brand-orange text-[9px] font-bold rounded uppercase tracking-wide">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-text-pale mt-1.5 font-sans leading-normal">{getPhaseDescription(index)}</p>
                                <span className="font-mono text-[9px] text-text-muted block mt-2 bg-[#050505] px-2 py-0.5 border border-white/5 rounded max-w-max">
                                  Pattern: {pattern}
                                </span>
                              </div>

                              <GlassButton
                                onClick={() => handleApplyAction(selectedJunctionId, index)}
                                disabled={wsState.controller === "ppo"}
                                variant={isCurrent ? "primary" : "secondary"}
                                size="sm"
                                className="w-full mt-3 font-mono text-[10px]"
                                title={wsState.controller === "ppo" ? "Disable PPO controller mode to override manually." : ""}
                              >
                                Override Phase
                              </GlassButton>
                            </div>
                          );
                        })}
                      </div>
                      
                      {wsState.controller === "ppo" && (
                        <div className="flex items-center gap-2 p-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange text-[10px] font-mono uppercase tracking-wider">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>PPO Optimization active. Switch simulation to Baseline to manually override signals.</span>
                        </div>
                      )}
                    </div>

                    {/* Applied overrides logs */}
                    <div className="pt-6 border-t border-[rgba(255,183,106,0.12)] space-y-3">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">Manual Override History</h4>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {actionHistory.length > 0 ? (
                          actionHistory.map((log, idx) => (
                            <div key={idx} className="p-3 bg-[#050505]/45 border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono text-text-cream">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-eco-success" />
                                <span>Phase {log.phase} applied to {log.junctionId}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{log.timestamp}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                            No override actions have been issued during this active session.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-text-muted font-mono">
                    Failed to fetch details for junction '{selectedJunctionId}'.
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-[rgba(255,183,106,0.12)] rounded-xl space-y-2">
                <GitFork className="h-8 w-8 text-text-dim/40 mb-2 animate-pulse" />
                <span className="font-sans">Select a discovered traffic light junction on the left to override phases.</span>
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      {/* Confirmation Modal */}
      <GlassModal
        isOpen={!!confirmPhase}
        onClose={() => setConfirmPhase(null)}
        title="Confirm Signal Override"
      >
        {confirmPhase && (
          <div className="space-y-4">
            <p>
              Are you sure you want to override the phase state of junction{" "}
              <span className="font-bold text-brand-orange">{confirmPhase.junctionId}</span> to{" "}
              <span className="font-bold text-brand-orange">Phase {confirmPhase.phaseIndex}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton
                onClick={() => setConfirmPhase(null)}
                variant="ghost"
                size="sm"
                className="font-mono"
              >
                Cancel
              </GlassButton>
              <GlassButton
                onClick={executeAction}
                variant="primary"
                size="sm"
                className="font-mono"
              >
                Confirm override
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
