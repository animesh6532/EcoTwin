import React from "react";
import { useLocationStore } from "../../store/locationStore";
import { useSimulationStore } from "../../store/simulationStore";
import { useQuery } from "@tanstack/react-query";
import { getSystemReadiness } from "../../api/health";
import { MapPin, Compass, RefreshCw } from "lucide-react";

export const OperationsStatus: React.FC = () => {
  const {
    city,
    locality,
    source,
    isDemoMode,
    accuracy,
    loading: geoLoading,
    setShowOnboardingModal,
    toggleDemoMode
  } = useLocationStore();

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

  // Query REST API Readiness
  const { data: isReady } = useQuery<{ status: string }, Error>({
    queryKey: ["apiReady"],
    queryFn: getSystemReadiness,
    refetchInterval: 10000,
  });

  const getLocationSourceTag = () => {
    switch (source) {
      case "GPS":
        return { label: "GPS LIVE", color: "text-[#39D98A] bg-[#39D98A]/10 border-[#39D98A]/30" };
      case "MANUAL":
        return { label: "MANUAL ENTRY", color: "text-[#4DA6FF] bg-[#4DA6FF]/10 border-[#4DA6FF]/30" };
      case "DEMO":
        return { label: "DEMO NETWORK", color: "text-[#FFB84D] bg-[#FFB84D]/10 border-[#FFB84D]/30" };
      default:
        return { label: "UNSET", color: "text-text-muted bg-white/5 border-white/10" };
    }
  };

  const locationTag = getLocationSourceTag();

  const getDotColor = (status: "healthy" | "unavailable" | "inactive" | boolean | string) => {
    const s = typeof status === "string" ? status.toLowerCase() : status;
    if (s === "healthy" || s === true || s === "connected" || s === "running") {
      return "bg-[#39D98A] shadow-[0_0_8px_#39D98A]";
    }
    if (s === "connecting" || s === "paused" || s === "degraded") {
      return "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D]";
    }
    if (s === "error" || s === "unavailable" || s === "offline") {
      return "bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]";
    }
    return "bg-[#8D7868]/45";
  };

  return (
    <div className="flex items-center gap-2 xl:gap-2.5 2xl:gap-3 text-xs font-mono select-none shrink-0 border-l border-white/10 pl-2 xl:pl-3 whitespace-nowrap">
      {/* 1. Location Pill + GPS Status */}
      <button
        onClick={() => setShowOnboardingModal(true)}
        className="group flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#14100D] border border-[#FF8A00]/25 hover:border-[#FF8A00]/60 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF8A00] shrink-0"
        title="Click to change target location context"
      >
        <div className="relative flex items-center justify-center shrink-0">
          {geoLoading ? (
            <RefreshCw className="h-3 w-3 text-[#FF8A00] animate-spin" />
          ) : (
            <MapPin className="h-3 w-3 text-[#FF8A00] group-hover:scale-110 transition-transform" />
          )}
        </div>

        <div className="flex items-center gap-1 text-left shrink-0">
          <span className="font-bold text-[#FFF7ED] text-[10px] xl:text-[11px] max-w-[90px] xl:max-w-[120px] 2xl:max-w-[150px] truncate">
            {geoLoading ? "Locating..." : city || locality || "Set Location"}
          </span>
          {accuracy && (
            <span className="text-[8.5px] text-[#A89582] hidden 2xl:inline shrink-0">
              (±{Math.round(accuracy)}m)
            </span>
          )}
        </div>

        <span className={`text-[7.5px] xl:text-[8px] font-bold tracking-wider px-1 py-0.5 rounded border uppercase shrink-0 ${locationTag.color}`}>
          {locationTag.label}
        </span>
      </button>

      {/* 2. Real-World / Demo State Indicator */}
      <button
        onClick={() => toggleDemoMode(!isDemoMode)}
        className={`flex items-center gap-1 px-1.5 xl:px-2 py-1 rounded-lg text-[8.5px] xl:text-[9px] font-bold tracking-wider uppercase border transition-all cursor-pointer shrink-0 ${
          isDemoMode
            ? "bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]/40 shadow-[0_0_8px_rgba(255,184,77,0.15)]"
            : "bg-white/5 text-[#A89582] border-white/10 hover:text-[#FFF7ED] hover:border-white/20"
        }`}
        title={isDemoMode ? "Currently in Demo mode. Click to switch to Real-World context." : "Currently in Real-World mode. Click to toggle Demo mode."}
      >
        <Compass className="h-2.5 w-2.5 xl:h-3 xl:w-3 shrink-0" />
        <span className="shrink-0">{isDemoMode ? "◉ DEMO" : "◉ REAL"}</span>
      </button>

      {/* 3. Live Simulation Telemetry Strip (Active Run Stats) - Always Visible */}
      <div className="flex items-center gap-1.5 xl:gap-2 border-x border-white/10 px-2 xl:px-2.5 text-[9px] xl:text-[9.5px] uppercase font-mono shrink-0">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[#A89582]">STATE:</span>
          <span className={`font-bold ${
            running 
              ? paused ? "text-[#FFB84D]" : "text-[#FF8A00] animate-pulse"
              : "text-[#39D98A]"
          }`}>
            {running ? (paused ? "PAUSED" : "ACTIVE") : "READY"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[#A89582]">TIME:</span>
          <span className="font-bold text-[#FFF7ED] bg-white/5 px-1 py-0.5 rounded border border-white/5 font-mono text-[8.5px] xl:text-[9px]">
            {(simulationTime || 0).toFixed(1)}s
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[#A89582]">CTRL:</span>
          <span className={`font-bold px-1 py-0.5 rounded text-[8px] xl:text-[8.5px] ${
            controller === "ppo"
              ? "text-[#FF8A00] bg-[#FF8A00]/15 border border-[#FF8A00]/30"
              : "text-[#FFF7ED] bg-white/5 border border-white/10"
          }`}>
            {controller === "ppo" ? "PPO" : "FIXED"}
          </span>
        </div>
      </div>

      {/* 4. Service Health Dot Matrix */}
      <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 2xl:gap-2.5 shrink-0 font-mono text-[8.5px] xl:text-[9px] font-bold tracking-wider text-[#A89582]">
        <div className="flex items-center gap-1" title="FastAPI REST API Status">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 shrink-0 ${getDotColor(!!isReady)}`} />
          <span className="shrink-0">API</span>
        </div>
        <div className="flex items-center gap-1" title="SUMO Simulator Engine Status">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 shrink-0 ${getDotColor(sumoStatus)}`} />
          <span className="shrink-0">SUMO</span>
        </div>
        <div className="flex items-center gap-1" title="TraCI Socket Bridge Status">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 shrink-0 ${getDotColor(traciStatus)}`} />
          <span className="shrink-0">TRACI</span>
        </div>
        <div className="flex items-center gap-1" title="PPO Neural Policy Model Status">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 shrink-0 ${getDotColor(ppoStatus)}`} />
          <span className="shrink-0">PPO</span>
        </div>
        <div className="flex items-center gap-1" title="WebSocket Telemetry Channel Status">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-300 shrink-0 ${getDotColor(connectionState)}`} />
          <span className="shrink-0">WS</span>
        </div>
      </div>
    </div>
  );
};

