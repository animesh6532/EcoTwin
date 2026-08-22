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

  // API status check
  const { data: isReady } = useQuery<{ status: string }, Error>({
    queryKey: ["apiReady"],
    queryFn: getSystemReadiness,
    refetchInterval: 10000, // check every 10s
  });

  const getStatusColor = (status: "healthy" | "unavailable" | "inactive" | boolean | string) => {
    if (status === "healthy" || status === true || status === "connected") return "bg-[#FF8A00] shadow-[0_0_8px_#FF8A00]";
    if (status === "connecting") return "bg-[#FFA347] shadow-[0_0_8px_#FFA347] animate-pulse";
    if (status === "paused") return "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D]";
    if (status === "error") return "bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]";
    return "bg-[#7A6A5C]"; // offline / inactive
  };

  return (
    <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono tracking-wider text-[#FFD2A3] select-none">
      {/* Simulation Clocks */}
      {running && (
        <div className="flex items-center gap-4 border-r border-white/10 pr-6">
          <div>
            STATUS:{" "}
            <span className={`font-bold uppercase ${paused ? "text-[#FFB84D]" : "text-[#FFA347] animate-pulse"}`}>
              {paused ? "PAUSED" : "RUNNING"}
            </span>
          </div>
          <div>
            TIME:{" "}
            <span className="font-bold text-[#FFF3E5]">
              {simulationTime.toFixed(1)}s
            </span>
          </div>
          <div>
            CTRL:{" "}
            <span className={`font-bold uppercase ${controller === "ppo" ? "text-[#FFA347] animate-pulse" : "text-[#FFF3E5]"}`}>
              {controller === "ppo" ? "PPO RL" : "FIXED-TIME"}
            </span>
          </div>
        </div>
      )}

      {/* Services Status Dots */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(!!isReady)}`} />
          <span>API</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(sumoStatus)}`} />
          <span>SUMO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(traciStatus)}`} />
          <span>TRACI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(ppoStatus)}`} />
          <span>PPO</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(connectionState)}`} />
          <span>WS</span>
        </div>
      </div>
    </div>
  );
}
