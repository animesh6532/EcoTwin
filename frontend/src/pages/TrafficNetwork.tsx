import { useQuery, useMutation } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getTrafficLights, getTrafficLightDetail, setTrafficLightAction } from "../api/trafficLights";
import { useState } from "react";
import { GitFork, CheckCircle, Clock, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "../utils/toast";

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
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Traffic Network Control</h1>
        <p className="text-[#FFD2A3] text-sm mt-1">
          Perform manual signal override and monitor microscopic phase configuration states.
        </p>
      </div>

      {!wsState.running ? (
        <div className="glass-panel max-w-2xl mx-auto p-12 text-center shadow-2xl border border-[#75451A]/20 space-y-4">
          <ShieldAlert className="h-12 w-12 text-[#FFB84D] mx-auto animate-pulse" />
          <h3 className="font-bold text-lg text-text-primary tracking-wide uppercase">Simulation is Inactive</h3>
          <p className="text-[#FFD2A3] text-sm leading-relaxed max-w-md mx-auto font-sans">
            Discovered traffic light junctions are only available while the SUMO environment is actively running. Start a SUMO session to inspect control systems.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Discovered Junctions */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575] mb-4 border-b border-[#75451A]/10 pb-3">Discovered Junctions</h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
              </div>
            ) : tlIds && tlIds.length > 0 ? (
              <div className="space-y-2">
                {tlIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedJunctionId(id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-mono font-semibold flex justify-between items-center ${
                      selectedJunctionId === id
                        ? "bg-[#FF8A00]/10 border-[#FF8A00] text-white"
                        : "bg-[#11100E] border-[#75451A]/20 text-[#FFF3E5] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-[#9A8575]" />
                      <span>ID: {id}</span>
                    </div>
                    <span className="text-[9px] text-[#FFB84D] uppercase">
                      {wsState.controller === "ppo" ? "PPO ACTIVE" : "FIXED"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                No active traffic light junctions found.
              </div>
            )}
          </div>

          {/* Selected Junction Details (Inspector & Control) */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl lg:col-span-2 space-y-6">
            {selectedJunctionId ? (
              <>
                <div className="flex justify-between items-start pb-4 border-b border-[#75451A]/10">
                  <div>
                    <h3 className="font-bold text-[#FFF3E5] text-base font-sans tracking-wide">Junction Override: {selectedJunctionId}</h3>
                    <p className="text-xs text-[#FFD2A3] mt-0.5 font-sans">Control configurations and phase selector</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#FFD2A3] font-mono tracking-wider">
                    <Cpu className="h-3.5 w-3.5 text-[#9A8575]" />
                    <span>MODE: {wsState.controller === "ppo" ? "PPO RL" : "FIXED"}</span>
                  </div>
                </div>

                {isLoadingDetail ? (
                  <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
                ) : tlDetail ? (
                  <div className="space-y-6">
                    {/* Phase Selector Grid */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-[#9A8575] uppercase tracking-wider font-mono">Select Manual Phase</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tlDetail.phases.map((pattern, index) => {
                          const isCurrent = tlDetail.active_phase === index;
                          return (
                            <div 
                              key={index} 
                              className={`p-4 rounded-xl border flex flex-col justify-between h-36 font-mono ${
                                isCurrent 
                                  ? "bg-[#FF8A00]/5 border-[#FF8A00]/30 shadow-sm shadow-orange-950/20" 
                                  : "bg-[#11100E] border-[#75451A]/20"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-[#FFF3E5] text-xs">Phase Index {index}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 bg-[#FF8A00]/10 text-[#FF8A00] text-[9px] font-bold rounded uppercase">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#FFD2A3] mt-1 font-sans">{getPhaseDescription(index)}</p>
                                <span className="font-mono text-[9px] text-[#9A8575] block mt-2 bg-white/5 px-2 py-1 border border-white/5 rounded max-w-max">
                                  Pattern: {pattern}
                                </span>
                              </div>

                              <button
                                onClick={() => handleApplyAction(selectedJunctionId, index)}
                                disabled={wsState.controller === "ppo"}
                                className={`w-full mt-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                  wsState.controller === "ppo"
                                    ? "bg-white/5 text-[#9A8575] cursor-not-allowed border border-transparent"
                                    : "bg-white/10 hover:bg-white/20 text-[#FFF3E5] border border-white/10"
                                }`}
                                title={wsState.controller === "ppo" ? "Disable PPO controller mode to override manually." : ""}
                              >
                                Override Phase
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      
                      {wsState.controller === "ppo" && (
                        <p className="text-[10px] text-[#FF8A00] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>PPO Optimization active. Switch simulation to Baseline to manually override signals.</span>
                        </p>
                      )}
                    </div>

                    {/* Applied actions history log */}
                    <div className="pt-6 border-t border-[#75451A]/10 space-y-3">
                      <h4 className="text-[10px] font-bold text-[#9A8575] uppercase tracking-wider font-mono">Manual Override History</h4>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {actionHistory.length > 0 ? (
                          actionHistory.map((log, idx) => (
                            <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between text-xs font-mono text-[#FFD2A3]">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span>Phase {log.phase} applied to {log.junctionId}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[#9A8575]">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{log.timestamp}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                            No override actions have been issued during this active session.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-[#9A8575] font-mono">
                    Failed to fetch details for junction '{selectedJunctionId}'.
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[#9A8575] text-xs border-2 border-dashed border-[#75451A]/20 rounded-xl space-y-2">
                <GitFork className="h-8 w-8 text-[#9A8575]/40 mb-2" />
                <span className="font-sans">Select a discovered traffic light junction on the left to override phases.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmPhase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-6">
          <div className="glass-panel max-w-sm w-full p-6 space-y-4 border border-[#75451A]/35 shadow-2xl">
            <h4 className="font-bold text-[#FFF3E5] text-sm flex items-center gap-2 font-sans">
              <AlertTriangle className="h-5 w-5 text-[#FFB84D]" /> Confirm Signal Override
            </h4>
            <p className="text-xs text-[#FFD2A3] leading-relaxed font-mono">
              Are you sure you want to override the phase state of junction{" "}
              <span className="font-bold text-[#FFF3E5]">{confirmPhase.junctionId}</span> to{" "}
              <span className="font-bold text-[#FFF3E5]">Phase {confirmPhase.phaseIndex}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmPhase(null)}
                className="px-4 py-2 text-xs font-semibold text-[#FFD2A3] hover:bg-white/10 rounded-lg transition-colors border border-white/10 font-mono"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="glass-button-accent font-mono text-xs"
              >
                Confirm override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
