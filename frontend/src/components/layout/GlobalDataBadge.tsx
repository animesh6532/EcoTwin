import React from "react";
import { useLocationStore } from "../../store/locationStore";
import { useSimulationStore } from "../../store/simulationStore";
import { MapPin, Navigation, Compass, AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalDataBadge() {
  const {
    city,
    locality,
    source,
    isDemoMode,
    accuracy,
    loading,
    error,
    setShowOnboardingModal,
    toggleDemoMode,
    detectBrowserLocation
  } = useLocationStore();

  const { connectionState, sumoStatus } = useSimulationStore();

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

  const tag = getLocationSourceTag();

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-mono select-none">
      {/* Location Capsule Button */}
      <button
        onClick={() => setShowOnboardingModal(true)}
        className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0D0B0A]/80 border border-[#FF8A00]/25 hover:border-[#FF8A00]/60 transition-all duration-300 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] cursor-pointer"
        title="Click to set or change location context"
      >
        <div className="relative flex items-center justify-center">
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 text-[#FF8A00] animate-spin" />
          ) : (
            <MapPin className="h-3.5 w-3.5 text-[#FF8A00] group-hover:scale-110 transition-transform" />
          )}
        </div>

        <div className="flex items-center gap-1.5 text-left">
          <span className="font-bold text-text-cream truncate max-w-[140px] sm:max-w-[180px]">
            {loading ? "Resolving Location..." : city || locality || "Set Target Location"}
          </span>
          {accuracy && (
            <span className="text-[10px] text-text-muted hidden sm:inline">
              (±{Math.round(accuracy)}m)
            </span>
          )}
        </div>

        <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${tag.color}`}>
          {tag.label}
        </span>
      </button>

      {/* Demo Mode Toggle Badge */}
      <button
        onClick={() => toggleDemoMode(!isDemoMode)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
          isDemoMode
            ? "bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]/40 shadow-[0_0_12px_rgba(255,184,77,0.2)]"
            : "bg-white/5 text-text-muted border-white/10 hover:text-text-pale hover:border-white/20"
        }`}
        title={isDemoMode ? "Currently running on Berlin SUMO Demo Grid. Click to switch to real location." : "Click to switch to Berlin SUMO Demo Grid."}
      >
        <Compass className="h-3 w-3" />
        <span>{isDemoMode ? "DEMO ACTIVE" : "REAL-WORLD"}</span>
      </button>

      {/* Source Data Badges */}
      <div className="hidden lg:flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase">
        <span className="px-2 py-0.5 rounded border bg-white/5 border-white/10 text-text-pale">
          TRAFFIC: <span className="text-[#FFB84D]">ESTIMATED</span>
        </span>
        <span className="px-2 py-0.5 rounded border bg-white/5 border-white/10 text-text-pale">
          SUMO: <span className={sumoStatus === "running" ? "text-[#39D98A]" : "text-[#FFB84D]"}>{sumoStatus.toUpperCase()}</span>
        </span>
        <span className="px-2 py-0.5 rounded border bg-white/5 border-white/10 text-text-pale">
          WS: <span className={connectionState === "connected" ? "text-[#39D98A]" : "text-text-muted"}>{connectionState.toUpperCase()}</span>
        </span>
      </div>
    </div>
  );
}
