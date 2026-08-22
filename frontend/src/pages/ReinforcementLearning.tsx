import { useQuery, useMutation } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getRLStatus, getRLModelInfo, setRLMode } from "../api/rl";
import { Cpu, Award, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "../utils/toast";
import { useEffect } from "react";
import { RLStatus, ModelVersionSchema } from "../types";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassStatus } from "../components/glass/GlassStatus";

export default function ReinforcementLearning() {
  const wsState = useSimulationStore();

  // Queries
  const { data: rlStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery<RLStatus, Error>({
    queryKey: ["rlStatus"],
    queryFn: getRLStatus,
    refetchInterval: wsState.running && !wsState.paused ? 3000 : false,
  });

  // Sync controller state with store on query load
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

  const comparisonMetrics = [
    { label: "CO₂ Emission Reduction", ppo: "12.4%", baseline: "0.0% (Ref)" },
    { label: "Average Delay Reduction", ppo: "15.8%", baseline: "0.0% (Ref)" },
    { label: "Intersection Throughput", ppo: "+8.2% veh/h", baseline: "Baseline" },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: "#FFF7ED",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 18px rgba(0,0,0,0.45)"
            }}
            className="uppercase font-sans leading-tight"
          >
            Reinforcement Learning Control
          </h1>
          <p className="text-[#CBB9A6] text-sm mt-2 leading-relaxed max-w-xl font-sans font-normal">
            Monitor the active deep reinforcement learning policy parameters and evaluate optimized rewards.
          </p>
        </div>
        
        {/* Top bar status */}
        <div className="flex flex-wrap items-center gap-3">
          <GlassStatus label="RL INFERENCE" status={rlStatus?.running ? "active" : "inactive"} />
          <GlassStatus label="MODEL VERSION" status={modelInfo ? `v${modelInfo.version}` : "none"} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Neural network specs and compare registry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Registry Card */}
          <GlassPanel className="p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,183,106,0.12)]">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted">Model Registry Details</h3>
              <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange font-bold text-[9px] rounded uppercase tracking-wider font-mono">
                Production-Ready
              </span>
            </div>

            {isLoadingModel ? (
              <div className="h-28 bg-[#120D09]/45 rounded-xl shimmer animate-pulse" />
            ) : modelInfo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-[#120D09]/45 p-3.5 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <span className="text-[#A9947D] text-[8px] uppercase tracking-wider font-bold">Model Name</span>
                  <div className="font-bold text-[#FFF7ED] mt-1 font-mono">{modelInfo.name}</div>
                </div>
                <div className="bg-[#120D09]/45 p-3.5 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <span className="text-[#A9947D] text-[8px] uppercase tracking-wider font-bold">Version</span>
                  <div className="font-bold text-[#FFF7ED] mt-1 font-mono">v{modelInfo.version}</div>
                </div>
                <div className="bg-[#120D09]/45 p-3.5 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <span className="text-[#A9947D] text-[8px] uppercase tracking-wider font-bold">Training Date</span>
                  <div className="font-bold text-[#FFF7ED] mt-1 font-mono">{modelInfo.training_date}</div>
                </div>
                <div className="bg-[#120D09]/45 p-3.5 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <span className="text-[#A9947D] text-[8px] uppercase tracking-wider font-bold">Feature Schema</span>
                  <div className="font-bold text-[#FFF7ED] mt-1 font-mono">v{modelInfo.feature_version}</div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                Registry metadata is currently unavailable.
              </div>
            )}

            {/* Neural network specs list */}
            <div className="text-xs text-text-pale leading-relaxed space-y-2 border-t border-[rgba(255,183,106,0.12)] pt-4 font-mono">
              <div className="font-bold text-text-cream text-[9px] uppercase tracking-widest mb-2 font-mono">Policy Network Architecture</div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-text-muted">Algorithm</span>
                <span className="font-bold text-text-cream">Proximal Policy Optimization (PPO)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-text-muted">Architecture Layers</span>
                <span className="font-bold text-text-cream">Actor-Critic MLP (64, 64)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-text-muted">Observation Space</span>
                <span className="font-bold text-text-cream">8-Dimensional Vector (Queue lengths, vehicle speeds)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Action Dimensions</span>
                <span className="font-bold text-text-cream">Discrete(4) (Traffic phase combinations)</span>
              </div>
            </div>
          </GlassPanel>

          {/* Comparison Baseline vs PPO */}
          <GlassPanel className="p-6 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#A9947D] mb-2 border-b border-[rgba(255,184,77,0.16)] pb-3">Optimization metrics</h3>
            
            <div className="space-y-3 font-mono">
              {comparisonMetrics.map((m, idx) => (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-[#120D09]/45 border border-[rgba(255,184,77,0.16)] rounded-xl text-xs">
                  <span className="font-bold text-[#FFF7ED] md:w-1/3 mb-1 md:mb-0">{m.label}</span>
                  
                  <div className="flex-1 flex gap-8 font-mono">
                    <div className="flex-1">
                      <span className="text-[8px] text-[#A9947D] block font-bold">Fixed-Time Baseline</span>
                      <span className="font-bold text-[#D6C3AE] mt-0.5 block">{m.baseline}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[8px] text-[#A9947D] block font-bold">PPO Agent Policy</span>
                      <span className="font-bold text-brand-orange mt-0.5 block">{m.ppo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Right 1 Col: Switcher and live metrics */}
        <div className="space-y-6">
          
          {/* Controller Mode Switcher */}
          <GlassCard variant="large" className="space-y-6">
            <div className="flex items-center gap-2 mb-1 border-b border-[rgba(255,183,106,0.12)] pb-3">
              <Cpu className="h-5 w-5 text-brand-orange" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-cream">Controller switcher</h3>
            </div>

            <div className="space-y-3 font-mono">
              <button
                onClick={() => handleToggleController("fixed_time")}
                disabled={toggleModeMutation.isPending || wsState.controller === "fixed_time"}
                style={
                  wsState.controller === "fixed_time"
                    ? { background: "rgba(255, 138, 0, 0.12)", border: "1px solid rgba(255, 138, 0, 0.55)", boxShadow: "0 0 25px rgba(255, 138, 0, 0.10)" }
                    : { background: "rgba(25, 20, 16, 0.60)", border: "1px solid rgba(255, 184, 77, 0.16)" }
                }
                className="w-full p-4 rounded-xl text-left flex flex-col justify-between transition-all"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-[#FFF7ED] text-xs font-mono">Fixed-Time Baseline</span>
                  {wsState.controller === "fixed_time" && (
                    <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#FF8A00]" />
                  )}
                </div>
                <p className="text-[11px] text-[#D6C3AE] mt-1.5 leading-relaxed font-sans font-normal">
                  Pre-timed signal transitions. Employs historical fixed cycles without dynamic queue adjustments.
                </p>
              </button>

              <button
                onClick={() => handleToggleController("ppo")}
                disabled={toggleModeMutation.isPending || wsState.controller === "ppo"}
                style={
                  wsState.controller === "ppo"
                    ? { background: "rgba(255, 138, 0, 0.12)", border: "1px solid rgba(255, 138, 0, 0.55)", boxShadow: "0 0 25px rgba(255, 138, 0, 0.10)" }
                    : { background: "rgba(25, 20, 16, 0.60)", border: "1px solid rgba(255, 184, 77, 0.16)" }
                }
                className="w-full p-4 rounded-xl text-left flex flex-col justify-between transition-all"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-[#FFF7ED] text-xs font-mono">PPO Optimization</span>
                  {wsState.controller === "ppo" && (
                    <span className="h-2 w-2 rounded-full bg-brand-orange animate-ping shadow-[0_0_8px_#FF8A00]" />
                  )}
                </div>
                <p className="text-[11px] text-[#D6C3AE] mt-1.5 leading-relaxed font-sans font-normal">
                  Reinforcement learning control. Employs the MLP policy to compute phase switches dynamically.
                </p>
              </button>
            </div>

            {!wsState.running && (
              <div className="flex items-center gap-2 text-[9px] text-text-muted font-mono uppercase tracking-wider">
                <AlertTriangle className="h-4.5 w-4.5 text-brand-amber" />
                <span>Simulation inactive. switcher locked.</span>
              </div>
            )}
          </GlassCard>

          {/* Live rewards and stats */}
          <GlassCard variant="large" className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-[rgba(255,183,106,0.12)] pb-3">Agent Telemetry</h3>
            
            {isLoadingStatus ? (
              <div className="h-28 bg-[#120D09]/45 rounded-xl shimmer animate-pulse" />
            ) : rlStatus ? (
              <div className="space-y-3.5 text-xs font-mono">
                
                <div className="p-3 bg-[#120D09]/45 border border-[rgba(255,184,77,0.16)] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#FF8A00]" />
                    <span className="text-[#A9947D] font-bold text-[10px]">Instant Reward</span>
                  </div>
                  <span className="font-bold text-[#FFF7ED] text-sm">
                    {wsState.running ? rlStatus.mean_reward.toFixed(2) : "0.00"}
                  </span>
                </div>

                <div className="p-3 bg-[#120D09]/45 border border-[rgba(255,184,77,0.16)] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#FFB84D]" />
                    <span className="text-[#A9947D] font-bold text-[10px]">Model Latency</span>
                  </div>
                  <span className="font-bold text-[#FFF7ED] text-sm">
                    {wsState.running ? `${rlStatus.latency_ms.toFixed(1)} ms` : "0.0 ms"}
                  </span>
                </div>

                <div className="p-3 bg-[#120D09]/45 border border-[rgba(255,184,77,0.16)] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
                    <span className="text-[#A9947D] font-bold text-[10px]">Model state</span>
                  </div>
                  <span className={`font-bold uppercase text-xs ${rlStatus.running ? "text-[#22C55E]" : "text-[#A9947D]"}`}>
                    {rlStatus.running ? "Active" : "Inactive"}
                  </span>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                No active agent data stream.
              </div>
            )}
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
