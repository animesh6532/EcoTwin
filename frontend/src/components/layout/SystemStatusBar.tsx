import { useSimulationStore } from "../../store/simulationStore";
import { useQuery } from "@tanstack/react-query";
import { getSystemReadiness } from "../../api/health";

export default function SystemStatusBar() {
  const {
    connectionState,
    running,
    paused,
    simulationTime,
    controller,
    sumoStatus,
    traciStatus,
    ppoStatus,
  } = useSimulationStore();

  // REST API status query
  const { data: isReady } = useQuery<{ status: string }, Error>({
    queryKey: ["apiReady"],
    queryFn: getSystemReadiness,
    refetchInterval: 10000,
  });

  const getStatusColor = (status: "healthy" | "unavailable" | "inactive" | boolean | string) => {
    const s = typeof status === "string" ? status.toLowerCase() : status;
    if (s === "healthy" || s === true || s === "connected" || s === "running") {
      return "bg-[#39D98A] shadow-[0_0_8px_#39D98A]"; // Healthy green
    }
    if (s === "connecting") {
      return "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D] animate-pulse"; // Transition Warning
    }
    if (s === "paused" || s === "degraded") {
      return "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D]"; // Warning
    }
    if (s === "error" || s === "unavailable" || s === "offline") {
      return "bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]"; // Error Red
    }
    return "bg-[#8D7868]/45"; // Inactive / Offline Gray
  };

  return (
    <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono tracking-wider text-text-pale select-none">
      {/* Simulation Clocks */}
      {running && (
        <div className="flex items-center gap-4 border-r border-white/10 pr-6">
          <div className="flex items-center gap-1">
            <span className="text-text-muted">STATE:</span>
            <span className={`font-bold uppercase ${paused ? "text-brand-amber" : "text-brand-orange animate-pulse"}`}>
              {paused ? "PAUSED" : "ACTIVE RUN"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-text-muted">TIME:</span>
            <span className="font-bold text-text-cream bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {simulationTime.toFixed(1)}s
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-text-muted">CNTRL:</span>
            <span className={`font-bold uppercase px-1.5 py-0.5 rounded ${
              controller === "ppo" 
                ? "text-brand-orange bg-brand-orange/10 border border-brand-orange/20 animate-pulse" 
                : "text-text-cream bg-white/5 border border-white/10"
            }`}>
              {controller === "ppo" ? "PPO Agent" : "Fixed-Time"}
            </span>
          </div>
        </div>
      )}

      {/* Services Status Dots */}
      <div className="flex items-center gap-4 shrink-0 font-mono text-[9px] font-bold tracking-widest text-text-muted">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${getStatusColor(!!isReady)}`} />
          <span>API</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${getStatusColor(sumoStatus)}`} />
          <span>SUMO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${getStatusColor(traciStatus)}`} />
          <span>TRACI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${getStatusColor(ppoStatus)}`} />
          <span>PPO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${getStatusColor(connectionState)}`} />
          <span>WS</span>
        </div>
      </div>
    </div>
  );
}
