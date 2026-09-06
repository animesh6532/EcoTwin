import React, { useState } from "react";
import { useLocationStore } from "../../store/locationStore";
import { 
  MapPin, 
  Navigation, 
  Search, 
  Compass, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Globe
} from "lucide-react";

export default function LocationOnboardingModal() {
  const {
    latitude,
    longitude,
    accuracy,
    city,
    state,
    country,
    locality,
    formattedAddress,
    source,
    isDemoMode,
    loading,
    error,
    nearbyRoads,
    showOnboardingModal,
    setShowOnboardingModal,
    detectBrowserLocation,
    setManualLocation,
    setManualCoordinates,
    toggleDemoMode
  } = useLocationStore();

  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<"gps" | "search" | "demo">("gps");

  if (!showOnboardingModal) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setManualLocation(searchInput.trim());
  };

  const handlePresetSelect = (lat: number, lng: number, label: string) => {
    setManualCoordinates(lat, lng, label);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div 
        style={{
          background: "linear-gradient(145deg, rgba(14, 12, 10, 0.95), rgba(8, 7, 6, 0.98))",
          borderColor: "rgba(255, 138, 0, 0.35)",
          boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 30px rgba(255,138,0,0.15)"
        }}
        className="w-full max-w-xl rounded-3xl border p-6 md:p-8 relative overflow-hidden flex flex-col gap-6 text-text-cream"
      >
        {/* Decorative ambient background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF8A00]/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#39D98A]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-[#FF8A00]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-text-cream">
                  Location Onboarding
                </h2>
                <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 uppercase">
                  Location Required
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Set target real-world location context for traffic intelligence & environmental telemetry.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOnboardingModal(false)}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-cream transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 relative z-10 text-xs font-mono">
          <button
            onClick={() => setActiveTab("gps")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "gps"
                ? "bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 shadow-sm"
                : "text-text-muted hover:text-text-cream"
            }`}
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>GPS Auto-Detect</span>
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "search"
                ? "bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 shadow-sm"
                : "text-text-muted hover:text-text-cream"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Manual Address</span>
          </button>

          <button
            onClick={() => setActiveTab("demo")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "demo"
                ? "bg-[#FFB84D]/20 text-[#FFB84D] border border-[#FFB84D]/40 shadow-sm"
                : "text-text-muted hover:text-text-cream"
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Demo Grid</span>
          </button>
        </div>

        {/* Tab 1: GPS Detection */}
        {activeTab === "gps" && (
          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-text-pale uppercase tracking-wider">
                  Browser Geolocation Engine
                </span>
                {source === "GPS" && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#39D98A] font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE GPS
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                EcoTwin requests browser location permissions to automatically center simulation views, query open-street network topology, and estimate localized vehicular emissions.
              </p>
              
              <button
                onClick={() => detectBrowserLocation()}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-black font-bold font-mono text-xs tracking-wider uppercase hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,138,0,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>DETECTING LOCATION...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    <span>DETECT MY LOCATION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Search Input */}
        {activeTab === "search" && (
          <div className="flex flex-col gap-4 relative z-10">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter city, locality, or street (e.g. Connaught Place, New Delhi)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-text-cream placeholder-text-muted focus:outline-none focus:border-[#FF8A00] transition-colors font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#FF8A00] text-black font-mono font-bold text-xs hover:bg-[#FF8A00]/90 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "SEARCHING..." : "RESOLVE"}
              </button>
            </form>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                Quick Global Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Berlin Mitte", lat: 52.5200, lng: 13.4050, tag: "SUMO Default" },
                  { name: "New Delhi Central", lat: 28.6139, lng: 77.2090, tag: "High Density" },
                  { name: "New York Times Sq", lat: 40.7580, lng: -73.9855, tag: "Grid Corridor" },
                  { name: "London City", lat: 51.5074, lng: -0.1278, tag: "Low Emission Zone" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset.lat, preset.lng, preset.name)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF8A00]/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-cream group-hover:text-[#FF8A00] transition-colors">
                        {preset.name}
                      </span>
                      <span className="text-[9px] font-mono text-text-muted">
                        {preset.lat.toFixed(2)}°, {preset.lng.toFixed(2)}°
                      </span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-text-pale border border-white/5">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Demo Mode Selection */}
        {activeTab === "demo" && (
          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-[#FFB84D]/10 border border-[#FFB84D]/30 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[#FFB84D]">
                <Compass className="h-5 w-5" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  SUMO Benchmark Grid (Berlin Mitte)
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Demo Mode loads the pre-compiled SUMO micro-simulation network (`net.net.xml`) configured with standard synthetic vehicle demands for RL policy evaluation.
              </p>
              <button
                onClick={() => {
                  toggleDemoMode(true);
                  setShowOnboardingModal(false);
                }}
                className="py-2.5 rounded-xl bg-[#FFB84D] text-black font-mono font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity cursor-pointer"
              >
                ACTIVATE BENCHMARK DEMO MODE
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-mono">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Resolved Location Info Card */}
        {latitude !== null && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold text-[#39D98A] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> CURRENT ACTIVE LOCATION
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                SOURCE: <strong className="text-text-cream">{source}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-text-muted uppercase">Target Locality / Address</span>
                <p className="font-bold text-text-cream truncate">{formattedAddress || city || "Resolved Region"}</p>
              </div>

              <div>
                <span className="text-[10px] text-text-muted uppercase">Coordinates & Accuracy</span>
                <p className="font-bold text-text-cream">
                  {latitude.toFixed(4)}°, {longitude.toFixed(4)}° {accuracy ? `(±${Math.round(accuracy)}m)` : ""}
                </p>
              </div>
            </div>

            {nearbyRoads.length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                  Detected Local Traffic Corridors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {nearbyRoads.map((road, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-text-pale"
                    >
                      {road}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10 relative z-10 font-mono text-xs">
          <button
            onClick={() => setShowOnboardingModal(false)}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-text-cream font-bold transition-colors cursor-pointer"
          >
            CONFIRM & CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
