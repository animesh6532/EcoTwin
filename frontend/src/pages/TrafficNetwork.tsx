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
  
  // Confirmation state
  const [confirmPhase, setConfirmPhase] = useState<{ junctionId: string; phaseIndex: number } | null>(null);

  // History of actions
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
      // Refetch wsState or simulation update if needed
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

  // Helper description for default phase configuration mapping
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
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Traffic Network Control</h1>
        <p className="text-text-secondary text-sm mt-1">
          Perform manual signal override and monitor microscopic phase configuration states.
        </p>
      </div>

      {!wsState.running ? (
        <div className="bg-white border border-border rounded-xl p-12 text-center shadow-sm max-w-2xl mx-auto space-y-4">
          <ShieldAlert className="h-12 w-12 text-traffic-yellow mx-auto" />
          <h3 className="font-bold text-lg text-text-primary">Simulation is Inactive</h3>
          <p className="text-text-secondary text-sm">
            Discovered traffic light junctions are only available while the SUMO environment is actively running. 
            Please navigate to Live Simulation and start a run.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of Discovered Junctions */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Discovered Junctions</h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-10 bg-bg-secondary rounded animate-pulse" />
                <div className="h-10 bg-bg-secondary rounded animate-pulse" />
              </div>
            ) : tlIds && tlIds.length > 0 ? (
              <div className="space-y-2">
                {tlIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedJunctionId(id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-semibold flex justify-between items-center ${
                      selectedJunctionId === id
                        ? "bg-eco-green/10 border-eco-green text-eco-forest"
                        : "bg-white border-border text-text-primary hover:bg-bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4 w-4 text-text-muted" />
                      <span>Intersection: {id}</span>
                    </div>
                    <span className="text-[10px] text-text-muted capitalize">
                      Active: {wsState.controller === "ppo" ? "PPO Optimized" : "Fixed-Time"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                No active traffic light junctions found in the current simulation layout.
              </div>
            )}
          </div>

          {/* Selected Junction Details (Inspector & Control) */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
            {selectedJunctionId ? (
              <>
                <div className="flex justify-between items-start pb-4 border-b border-border">
                  <div>
                    <h3 className="font-bold text-text-primary text-base">Junction: {selectedJunctionId}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Control configurations and phase selector</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                    <Cpu className="h-3.5 w-3.5 text-text-muted" />
                    <span>Mode: {wsState.controller === "ppo" ? "PPO RL" : "Fixed-Time"}</span>
                  </div>
                </div>

                {isLoadingDetail ? (
                  <div className="h-40 bg-bg-secondary rounded animate-pulse" />
                ) : tlDetail ? (
                  <div className="space-y-6">
                    {/* Phase Selector Grid */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Select Manual Phase</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tlDetail.phases.map((pattern, index) => {
                          const isCurrent = tlDetail.active_phase === index;
                          return (
                            <div 
                              key={index} 
                              className={`p-4 rounded-xl border flex flex-col justify-between h-36 ${
                                isCurrent 
                                  ? "bg-eco-green/5 border-eco-green/40 shadow-sm" 
                                  : "bg-bg-secondary border-border"
                              }`}
                            >
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-text-primary text-xs">Phase Index {index}</span>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 bg-eco-green/10 text-eco-green text-[10px] font-bold rounded">
                                      Active Phase
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-secondary mt-1">{getPhaseDescription(index)}</p>
                                <span className="font-mono text-[9px] text-text-muted block mt-2 bg-white px-2 py-1 border border-border rounded max-w-max">
                                  Pattern: {pattern}
                                </span>
                              </div>

                              <button
                                onClick={() => handleApplyAction(selectedJunctionId, index)}
                                disabled={wsState.controller === "ppo"}
                                className={`w-full mt-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                  wsState.controller === "ppo"
                                    ? "bg-text-muted/10 text-text-muted cursor-not-allowed"
                                    : "bg-white hover:bg-bg-secondary text-text-primary border border-border shadow-xs"
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
                        <p className="text-[11px] text-carbon-alert flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>PPO optimization is currently active. Switch simulation to Baseline to manually override signals.</span>
                        </p>
                      )}
                    </div>

                    {/* Applied actions history log */}
                    <div className="pt-6 border-t border-border space-y-3">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Manual Override History</h4>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {actionHistory.length > 0 ? (
                          actionHistory.map((log, idx) => (
                            <div key={idx} className="p-3 bg-bg-secondary border border-border rounded-lg flex items-center justify-between text-xs font-mono text-text-secondary">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-eco-green" />
                                <span>Phase {log.phase} applied to {log.junctionId}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-text-muted">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{log.timestamp}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                            No override actions have been issued during this active session.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-text-muted">
                    Failed to fetch details for traffic light junction '{selectedJunctionId}'.
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-xl">
                <GitFork className="h-8 w-8 text-text-muted/40 mb-2" />
                <span>Select a discovered traffic light junction on the left to override phases.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmPhase && (
        <div className="fixed inset-0 bg-carbon-dark/20 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-border rounded-xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-traffic-yellow" /> Confirm Signal Override
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to override the phase state of junction{" "}
              <span className="font-bold text-text-primary">{confirmPhase.junctionId}</span> to{" "}
              <span className="font-bold text-text-primary">Phase {confirmPhase.phaseIndex}</span>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmPhase(null)}
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-bg-secondary rounded-lg transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="px-4 py-2 text-xs font-semibold bg-eco-forest hover:bg-eco-forest/90 text-white rounded-lg transition-colors"
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
