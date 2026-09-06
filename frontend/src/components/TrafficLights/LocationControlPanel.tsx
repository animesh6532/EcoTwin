import React from "react";
import { Navigation, MapPin, Compass, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { GlassPanel } from "../glass/GlassPanel";
import { GlassButton } from "../glass/GlassButton";

interface LocationControlPanelProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | "unknown";
  onDetectLocation: () => void;
  onClearLocation: () => void;
  onJumpToSimulation: () => void;
  onJumpToUser: () => void;
}

export const LocationControlPanel: React.FC<LocationControlPanelProps> = ({
  latitude,
  longitude,
  accuracy,
  loading,
  error,
  permissionState,
  onDetectLocation,
  onClearLocation,
  onJumpToSimulation,
  onJumpToUser,
}) => {
  const hasUserCoords = latitude !== null && longitude !== null;

  return (
    <GlassPanel className="p-4 space-y-4 font-mono text-xs border-[rgba(255,184,77,0.16)]">
      <div className="flex justify-between items-center pb-2 border-b border-[rgba(255,183,106,0.12)]">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-brand-orange" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-cream">
            LOCATION ARCHITECTURE & GEOLOCATION
          </h3>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-white/5 border border-white/10 text-text-pale">
          GPS vs SIMULATION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. REAL USER BROWSER LOCATION */}
        <div className="p-3.5 rounded-xl bg-[#120D09]/60 border border-[rgba(255,184,77,0.16)] space-y-3 relative">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> LIVE USER LOCATION
            </span>
            <span
              className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                hasUserCoords
                  ? "text-eco-success bg-eco-success/10 border-eco-success/20"
                  : error || permissionState === "denied"
                  ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                  : "text-text-muted bg-white/5 border-white/10"
              }`}
            >
              {hasUserCoords
                ? "LOCATION DETECTED"
                : permissionState === "denied"
                ? "ACCESS DENIED"
                : error
                ? "UNAVAILABLE"
                : "NOT REQUESTED"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-brand-amber text-xs py-1">
              <RefreshCw className="h-4 w-4 animate-spin text-brand-orange" />
              <span>Detecting browser GPS coordinates...</span>
            </div>
          ) : hasUserCoords ? (
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-text-pale">Latitude:</span>
                <strong className="text-text-cream">{latitude.toFixed(5)}° N</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-pale">Longitude:</span>
                <strong className="text-text-cream">{longitude.toFixed(5)}° E</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-pale">GPS Accuracy:</span>
                <strong className="text-emerald-400">±{Math.round(accuracy || 0)} meters</strong>
              </div>

              <div className="flex gap-2 pt-2">
                <GlassButton onClick={onJumpToUser} variant="secondary" size="sm" className="w-full text-[9px] font-mono">
                  LOCATE ME
                </GlassButton>
                <GlassButton onClick={onClearLocation} variant="ghost" size="sm" className="text-[9px] font-mono text-rose-400">
                  CLEAR
                </GlassButton>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-[10px] text-text-pale font-sans">
              <p className="leading-relaxed">
                {permissionState === "denied"
                  ? "LOCATION ACCESS DENIED: Browser permission was blocked. Enable location permissions in browser settings."
                  : error
                  ? `LOCATION UNAVAILABLE: ${error}`
                  : "Click below to detect your actual physical GPS location and display your marker relative to the simulation network."}
              </p>

              <GlassButton
                onClick={onDetectLocation}
                variant="primary"
                size="sm"
                className="w-full text-[10px] font-mono text-white bg-brand-orange"
              >
                ENABLE LOCATION / DETECT GPS
              </GlassButton>
            </div>
          )}
        </div>

        {/* 2. SUMO SIMULATION NETWORK BOUNDARIES */}
        <div className="p-3.5 rounded-xl bg-[#120D09]/60 border border-[rgba(255,184,77,0.16)] space-y-3 relative">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5" /> SIMULATION NETWORK
            </span>
            <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
              SUMO CITY NETWORK
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-text-pale">Network ID:</span>
              <strong className="text-text-cream">SUMO City Grid (city.net.xml)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-pale">Cartesian Bounds:</span>
              <strong className="text-text-cream">[0, 0] to [1000m, 1000m]</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-pale">Base Map Origin:</span>
              <strong className="text-cyan-300">52.5200° N, 13.4050° E</strong>
            </div>

            <div className="pt-2">
              <GlassButton onClick={onJumpToSimulation} variant="secondary" size="sm" className="w-full text-[9px] font-mono">
                JUMP TO SIMULATION NETWORK
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};
