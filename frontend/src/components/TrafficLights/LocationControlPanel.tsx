import React from "react";
import { Navigation, MapPin, Compass, Crosshair } from "lucide-react";
import { useLocationStore } from "../../store/locationStore";

interface LocationControlPanelProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  permissionState: PermissionState | "unknown";
  onDetectLocation: () => void;
}

export const LocationControlPanel: React.FC<LocationControlPanelProps> = ({
  latitude,
  longitude,
  accuracy,
  loading,
  permissionState,
  onDetectLocation,
}) => {
  const hasUserCoords = latitude !== null && longitude !== null;
  const { city, locality, isDemoMode, toggleDemoMode } = useLocationStore();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#120D09]/70 border border-[rgba(255,184,77,0.16)] font-mono text-xs">
      {/* Left: Real-world GPS location */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14100D] border border-[#FF8A00]/30 text-text-cream font-bold text-[11px]">
          <MapPin className="h-3.5 w-3.5 text-[#FF8A00]" />
          <span>{loading ? "LOCATING..." : city || locality || "Location Unset"}</span>
        </div>

        {hasUserCoords ? (
          <div className="flex items-center gap-2 text-[10px] text-text-pale bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
            <span>[{latitude.toFixed(5)}° N]</span>
            <span>[{longitude.toFixed(5)}° E]</span>
            {accuracy && <span className="text-emerald-400 font-bold">(±{Math.round(accuracy)}m)</span>}
          </div>
        ) : null}

        <span className={`text-[8.5px] px-2 py-0.5 rounded font-bold uppercase border ${
          hasUserCoords
            ? "text-eco-success bg-eco-success/10 border-eco-success/20"
            : permissionState === "denied"
            ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
            : "text-text-muted bg-white/5 border-white/10"
        }`}>
          {hasUserCoords ? "GPS LIVE" : permissionState === "denied" ? "PERMISSION REQUIRED" : "LOCATION UNAVAILABLE"}
        </span>

        {!hasUserCoords && !loading && (
          <button
            onClick={onDetectLocation}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF8A00]/15 border border-[#FF8A00]/40 text-[#FF8A00] text-[10px] font-bold uppercase hover:bg-[#FF8A00]/25 transition-colors cursor-pointer"
          >
            <Crosshair className="h-3 w-3" />
            <span>ENABLE LOCATION</span>
          </button>
        )}
      </div>

      {/* Right: Simulation network context badge */}
      <div className="flex items-center gap-2 text-[10px]">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
          <Navigation className="h-3.5 w-3.5" />
          <span className="text-text-muted">NETWORK:</span>
          <strong className="font-bold">SUMO City Grid</strong>
        </div>

        <button
          onClick={() => toggleDemoMode(!isDemoMode)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold uppercase border transition-all cursor-pointer ${
            isDemoMode
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
              : "bg-white/5 text-text-pale border-white/10 hover:text-text-cream"
          }`}
          title={isDemoMode ? "Currently running on Berlin SUMO Demo Grid." : "Currently running on Real-World location grid."}
        >
          <Compass className="h-3 w-3" />
          <span>{isDemoMode ? "SIMULATION DEMO" : "REAL-WORLD CONTEXT"}</span>
        </button>
      </div>
    </div>
  );
};


