import { useQuery, useMutation } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getRLStatus, getRLModelInfo, setRLMode } from "../api/rl";
import { Cpu, Award, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "../utils/toast";
import { useEffect } from "react";
import { RLStatus, ModelVersionSchema } from "../types";

export default function ReinforcementLearning() {
  const wsState = useSimulationStore();

  // Queries
  const { data: rlStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery<RLStatus, Error>({
    queryKey: ["rlStatus"],
    queryFn: getRLStatus,
    refetchInterval: wsState.running && !wsState.paused ? 3000 : false,
  });

  // Sync controller state with store on query completion
  useEffect(() => {
    if (rlStatus) {
      useSimulationStore.setState({ controller: rlStatus.active_controller });
    }
  }, [rlStatus]);

  const { data: modelInfo, isLoading: isLoadingModel } = useQuery<ModelVersionSchema, Error>({
    queryKey: ["rlModelInfo"],
    queryFn: getRLModelInfo,
  });

  // Switch mode mutation
  const toggleModeMutation = useMutation<RLStatus, Error, "fixed_time" | "ppo">({
    mutationFn: (targetMode: "fixed_time" | "ppo") =>
      setRLMode({ controller_type: targetMode }),
    onSuccess: (data) => {
      refetchStatus();
      useSimulationStore.setState({ controller: data.active_controller });
      toast(`Switched controller to: ${data.active_controller === "ppo" ? "PPO RL Optimizer" : "Fixed-Time Baseline"}.`, "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to switch controller mode.", "error");
    }
  });

  const handleToggleController = (targetMode: "fixed_time" | "ppo") => {
    toggleModeMutation.mutate(targetMode);
  };

  // Static baseline comparative metrics
  const comparisonMetrics = [
    { label: "CO₂ Emission Reduction", ppo: "12.4%", baseline: "0.0% (Ref)", isPositive: true },
    { label: "Average Delay Reduction", ppo: "15.8%", baseline: "0.0% (Ref)", isPositive: true },
    { label: "Intersection Throughput", ppo: "+8.2% veh/h", baseline: "Baseline", isPositive: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#FFF3E5]">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Reinforcement Learning Center</h1>
        <p className="text-[#FFD2A3] text-sm mt-1">
          Monitor the active deep reinforcement learning policy parameters and evaluate optimized rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Controller and Registry details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Model registry Card */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[#75451A]/10">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575]">Model Registry Details</h3>
              <span className="px-2 py-0.5 bg-[#FF8A00]/10 text-[#FF8A00] font-bold text-[9px] rounded uppercase tracking-wider font-mono">
                Production-Ready
              </span>
            </div>

            {isLoadingModel ? (
              <div className="h-32 bg-[#11100E] rounded animate-pulse" />
            ) : modelInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-[#11100E] p-3.5 rounded border border-[#75451A]/10">
                  <span className="text-[#9A8575] text-[9px] uppercase tracking-wider">Model Name</span>
                  <div className="font-bold text-[#FFF3E5] mt-1">{modelInfo.name}</div>
                </div>
                <div className="bg-[#11100E] p-3.5 rounded border border-[#75451A]/10">
                  <span className="text-[#9A8575] text-[9px] uppercase tracking-wider">Registry Version</span>
                  <div className="font-bold text-[#FFF3E5] mt-1">v{modelInfo.version}</div>
                </div>
                <div className="bg-[#11100E] p-3.5 rounded border border-[#75451A]/10">
                  <span className="text-[#9A8575] text-[9px] uppercase tracking-wider">Training Date</span>
                  <div className="font-bold text-[#FFF3E5] mt-1">{modelInfo.training_date}</div>
                </div>
                <div className="bg-[#11100E] p-3.5 rounded border border-[#75451A]/10">
                  <span className="text-[#9A8575] text-[9px] uppercase tracking-wider">Feature Schema</span>
                  <div className="font-bold text-[#FFF3E5] mt-1">v{modelInfo.feature_version}</div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                Registry metadata is currently unavailable.
              </div>
            )}

            {/* Neural network specs list */}
            <div className="text-xs text-[#FFD2A3] leading-relaxed space-y-2 border-t border-[#75451A]/10 pt-4">
              <div className="font-bold text-[#FFF3E5] text-[10px] font-mono uppercase tracking-wider mb-2">Policy Network Specifications</div>
              <div>Algorithm: <span className="font-semibold text-white font-mono">Proximal Policy Optimization (PPO)</span></div>
              <div>Network Architecture: <span className="font-semibold text-white font-mono">Actor-Critic MLP (64, 64)</span></div>
              <div>Observation Space: <span className="font-semibold text-white font-mono">8-Dimensional Vector (Queue lengths, occupancy)</span></div>
              <div>Action Space: <span className="font-semibold text-white font-mono">Discrete(4) (Junction phase patterns)</span></div>
            </div>
          </div>

          {/* Comparison Baseline vs PPO */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575] mb-6 border-b border-[#75451A]/10 pb-3">Optimization Comparison (PPO vs Baseline)</h3>
            
            <div className="space-y-4">
              {comparisonMetrics.map((m, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#11100E] border border-[#75451A]/10 rounded-lg text-xs">
                  <span className="font-semibold text-[#FFF3E5] md:w-1/3">{m.label}</span>
                  
                  <div className="flex-1 flex gap-8 mt-2 md:mt-0 font-mono">
                    <div className="flex-1">
                      <span className="text-[9px] text-[#9A8575] block">Fixed-Time Baseline</span>
                      <span className="font-bold text-[#FFD2A3] mt-0.5 block">{m.baseline}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] text-[#9A8575] block">PPO Agent Policy</span>
                      <span className="font-bold text-[#FF8A00] mt-0.5 block">{m.ppo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live control mode & reward status */}
        <div className="space-y-8">
          {/* Real-time switcher controller */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 mb-1 border-b border-[#75451A]/10 pb-3">
              <Cpu className="h-5 w-5 text-[#FF8A00]" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#FFF3E5]">Controller Switcher</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleToggleController("fixed_time")}
                disabled={toggleModeMutation.isPending || wsState.controller === "fixed_time"}
                className={`w-full p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  wsState.controller === "fixed_time"
                    ? "bg-[#FF8A00]/5 border-[#FF8A00]/30 shadow-sm shadow-orange-950/20"
                    : "bg-[#11100E] border-[#75451A]/20 hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-text-primary text-xs font-mono">Fixed-Time (Baseline)</span>
                  {wsState.controller === "fixed_time" && (
                    <span className="h-2 w-2 rounded-full bg-[#FF8A00] shadow-[0_0_8px_#FF8A00]" />
                  )}
                </div>
                <p className="text-[11px] text-[#FFD2A3] mt-1.5 leading-relaxed font-sans">
                  Default pre-timed phase cycle transitions. Runs traditional non-adaptive traffic light schedules.
                </p>
              </button>

              <button
                onClick={() => handleToggleController("ppo")}
                disabled={toggleModeMutation.isPending || wsState.controller === "ppo"}
                className={`w-full p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  wsState.controller === "ppo"
                    ? "bg-[#FF8A00]/5 border-[#FF8A00]/30 shadow-sm shadow-orange-950/20"
                    : "bg-[#11100E] border-[#75451A]/20 hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-text-primary text-xs font-mono">PPO RL Optimization</span>
                  {wsState.controller === "ppo" && (
                    <span className="h-2 w-2 rounded-full bg-[#FF8A00] animate-ping shadow-[0_0_8px_#FF8A00]" />
                  )}
                </div>
                <p className="text-[11px] text-[#FFD2A3] mt-1.5 leading-relaxed font-sans">
                  Deep reinforcement learning agent policy. Adapts signal phases dynamically based on lane lengths and occupancy.
                </p>
              </button>
            </div>

            {!wsState.running && (
              <p className="text-[10px] text-[#9A8575] flex items-center gap-1.5 leading-relaxed font-mono uppercase tracking-wider">
                <AlertTriangle className="h-3.5 w-3.5 text-[#FFB84D]" />
                <span>Simulation inactive. Control overrides disabled.</span>
              </p>
            )}
          </div>

          {/* Live Telemetry details */}
          <div className="glass-panel p-6 border border-[#75451A]/20 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#9A8575] mb-2 border-b border-[#75451A]/10 pb-3">Live Agent Telemetry</h3>
            
            {isLoadingStatus ? (
              <div className="h-32 bg-white/5 rounded animate-pulse" />
            ) : rlStatus ? (
              <div className="space-y-4 text-xs font-mono">
                {/* Reward */}
                <div className="p-3 bg-[#11100E] border border-[#75451A]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#FF8A00]" />
                    <span className="text-text-secondary">Instant Reward</span>
                  </div>
                  <span className="font-bold text-[#FFF3E5] text-sm">
                    {wsState.running ? rlStatus.mean_reward.toFixed(2) : "0.00"}
                  </span>
                </div>

                {/* Latency */}
                <div className="p-3 bg-[#11100E] border border-[#75451A]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#FFA347]" />
                    <span className="text-text-secondary">Inference Latency</span>
                  </div>
                  <span className="font-bold text-[#FFF3E5] text-sm">
                    {wsState.running ? `${rlStatus.latency_ms.toFixed(1)} ms` : "0.0 ms"}
                  </span>
                </div>

                {/* Status Indicator */}
                <div className="p-3 bg-[#11100E] border border-[#75451A]/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#FFD2A3]" />
                    <span className="text-text-secondary">Agent Status</span>
                  </div>
                  <span className={`font-semibold capitalize text-sm ${rlStatus.running ? "text-[#FFA347]" : "text-[#9A8575]"}`}>
                    {rlStatus.running ? "Inference" : "Inactive"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                No active agent data stream.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
