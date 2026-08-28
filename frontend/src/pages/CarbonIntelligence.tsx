import { useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { getCurrentEmissions, getAccumulatedEmissions, getEmissionHotspots } from "../api/emissions";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Leaf, Activity, Info, Droplet, Layers } from "lucide-react";
import L from "leaflet";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassMetric } from "../components/glass/GlassMetric";
import { GlassChart } from "../components/glass/GlassChart";
import { GlassStatus } from "../components/glass/GlassStatus";
import { useGeolocation } from "../hooks/useGeolocation";

const CENTER_LAT = 52.5200;
const CENTER_LNG = 13.4050;

function sumoToLatLng(x: number, y: number): [number, number] {
  const lat = CENTER_LAT + (y / 111320);
  const lng = CENTER_LNG + (x / (111320 * Math.cos(CENTER_LAT * Math.PI / 180)));
  return [lat, lng];
}

export default function CarbonIntelligence() {
  const wsState = useSimulationStore();
  const [activePollutionType, setActivePollutionType] = useState<"co2" | "nox">("co2");
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const gridCellsRef = useRef<L.Rectangle[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const [tileError, setTileError] = useState(false);

  const { 
    latitude, 
    longitude, 
    accuracy, 
    loading: geoLoading, 
    error: geoError, 
    detectLocation, 
    clearLocation 
  } = useGeolocation();

  // Queries
  const { data: currentEmissions } = useQuery({
    queryKey: ["currentEmissions"],
    queryFn: getCurrentEmissions,
    refetchInterval: wsState.running && !wsState.paused ? 2000 : false,
  });

  const { data: accumulatedEmissions } = useQuery({
    queryKey: ["accumulatedEmissions"],
    queryFn: getAccumulatedEmissions,
    refetchInterval: wsState.running && !wsState.paused ? 5000 : false,
  });

  const { data: hotspots, isLoading: isLoadingHotspots } = useQuery({
    queryKey: ["hotspotsList"],
    queryFn: getEmissionHotspots,
    refetchInterval: wsState.running && !wsState.paused ? 5000 : false,
  });

  // Local history
  const [rateHistory, setRateHistory] = useState<{ time: string; co2: number; nox: number; fuel: number }[]>([]);

  useEffect(() => {
    if (wsState.running && currentEmissions) {
      setRateHistory((prev) => {
        const timeStr = `${wsState.simulationTime.toFixed(0)}s`;
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          return prev;
        }
        const next = [
          ...prev,
          {
            time: timeStr,
            co2: currentEmissions.co2,
            nox: currentEmissions.nox,
            fuel: currentEmissions.fuel,
          },
        ];
        return next.slice(-20);
      });
    }
  }, [wsState.simulationTime, currentEmissions, wsState.running]);

  // Initialize Map on mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      maxZoom: 17,
      minZoom: 15,
    }).setView([CENTER_LAT, CENTER_LNG], 16.5);

    // Standard OpenStreetMap Map Tiles (inverted via global CSS filter)
    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    tiles.on("tileerror", () => {
      setTileError(true);
    });
    tiles.addTo(map);

    // Road references
    const lineOptions = { color: "#2A170C", weight: 6, opacity: 0.4 };
    L.polyline([sumoToLatLng(0, -500), sumoToLatLng(0, 500)], lineOptions).addTo(map);
    L.polyline([sumoToLatLng(-500, 0), sumoToLatLng(500, 0)], lineOptions).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user location marker on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || latitude === null || longitude === null) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }
      return;
    }

    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (userCircleRef.current) userCircleRef.current.remove();

    // Accuracy Circle
    if (accuracy) {
      userCircleRef.current = L.circle([latitude, longitude], {
        radius: accuracy,
        color: "#FF8A00",
        weight: 1,
        fillColor: "#FF8A00",
        fillOpacity: 0.1,
      }).addTo(map);
    }

    // You are here marker
    userMarkerRef.current = L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'custom-user-marker',
        html: `<div class="relative flex items-center justify-center">
                 <span class="absolute inline-flex h-6 w-6 rounded-full bg-brand-orange/35 animate-ping"></span>
                 <span class="relative flex h-3 w-3 rounded-full bg-brand-orange border border-white"></span>
               </div>`,
        iconSize: [24, 24]
      })
    }).addTo(map)
      .bindPopup('<div class="font-mono text-[10px] text-brand-orange bg-[#050505] p-2 border border-brand-orange/20 rounded-md">📍 You are here</div>');

    map.flyTo([latitude, longitude], 16);
  }, [latitude, longitude, accuracy]);

  // Update Heatmap grid cells
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old
    gridCellsRef.current.forEach((cell) => cell.remove());
    gridCellsRef.current = [];

    // Redraw cells with orange -> amber -> red intensity scales
    wsState.pollution.forEach((cell) => {
      const halfSize = 25;
      const bounds: [[number, number], [number, number]] = [
        sumoToLatLng(cell.x - halfSize, cell.y - halfSize),
        sumoToLatLng(cell.x + halfSize, cell.y + halfSize)
      ];

      // Calculate intensity factor based on active pollution type
      let cellIntensity = cell.intensity;
      if (activePollutionType === "nox") {
        // Estimate NOx intensity based on relative CO2 rate
        cellIntensity = Math.min((cell.co2 / 400), 1.0);
      }

      // LOW: Light Peach/Amber -> MODERATE: Amber -> HIGH: Orange -> CRITICAL: Red
      let fillColor = "#FFD2A3"; // low
      if (cellIntensity > 0.85) fillColor = "#FF4D4D"; // critical
      else if (cellIntensity > 0.55) fillColor = "#FF8A00"; // high
      else if (cellIntensity > 0.25) fillColor = "#FFB84D"; // moderate

      const rect = L.rectangle(bounds, {
        stroke: false,
        fillColor: fillColor,
        fillOpacity: cellIntensity * 0.45,
      }).addTo(map);

      rect.on("click", () => {
        const val = activePollutionType === "co2" ? `${cell.co2.toFixed(1)} mg` : `${(cell.co2 * 0.08).toFixed(2)} mg`;
        L.popup()
          .setLatLng(sumoToLatLng(cell.x, cell.y))
          .setContent(`<div class="font-mono text-xs text-brand-orange bg-[#050505] p-2 border border-brand-orange/20 rounded-md">
            Intensity: ${(cellIntensity * 100).toFixed(0)}%<br/>
            ${activePollutionType.toUpperCase()}: ${val}
          </div>`)
          .openOn(map);
      });

      gridCellsRef.current.push(rect);
    });
  }, [wsState.pollution, activePollutionType]);

  // Carbon Pressure Index calculation
  const getCarbonPressureIndex = () => {
    const co2Rate = currentEmissions?.co2 ?? 0;
    const noxRate = currentEmissions?.nox ?? 0;
    const avgWait = wsState.metrics.average_waiting_time;

    const co2Score = Math.min((co2Rate / 10000) * 100, 100);
    const noxScore = Math.min((noxRate / 100) * 100, 100);
    const waitScore = Math.min((avgWait / 60) * 100, 100);

    const totalScore = (co2Score * 0.5) + (noxScore * 0.3) + (waitScore * 0.2);

    let status: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    let color = "text-[#FFD2A3] bg-[#FFD2A3]/5 border-[#FFD2A3]/20";
    let icon = ShieldCheck;

    if (totalScore > 75) {
      status = "CRITICAL";
      color = "text-[#FF4D4D] bg-[#FF4D4D]/5 border-[#FF4D4D]/20";
      icon = ShieldAlert;
    } else if (totalScore > 45) {
      status = "HIGH";
      color = "text-brand-orange bg-brand-orange/5 border-brand-orange/20";
      icon = AlertTriangle;
    } else if (totalScore > 20) {
      status = "MODERATE";
      color = "text-brand-amber bg-brand-amber/5 border-brand-amber/20";
      icon = AlertTriangle;
    }

    return { score: totalScore, status, color, icon };
  };

  const cpi = getCarbonPressureIndex();
  const IconCpi = cpi.icon;

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase font-sans">Carbon Intelligence</h1>
          <p className="text-text-pale text-xs mt-1">
            Monitor dynamic environmental footprints, pollution hotspots, and spatial dispersal factors.
          </p>
        </div>
        
        {/* Top parameters status */}
        <div className="flex flex-wrap items-center gap-3">
          <GlassStatus label="ACCUMULATED CO₂" status={`${accumulatedEmissions ? (accumulatedEmissions.co2 / 1000).toFixed(1) : 0} g`} />
          <GlassStatus label="ACCUMULATED NOₓ" status={`${accumulatedEmissions ? (accumulatedEmissions.nox / 1000).toFixed(2) : 0} g`} />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassMetric
          label="CO₂ Emission Rate"
          value={currentEmissions ? `${(currentEmissions.co2 / 1000).toFixed(2)} g/s` : "0.00 g/s"}
          icon={Leaf}
        />
        <GlassMetric
          label="NOx Emission Rate"
          value={currentEmissions ? `${(currentEmissions.nox / 1000).toFixed(3)} g/s` : "0.000 g/s"}
          icon={Activity}
        />
        <GlassMetric
          label="Fuel Consumption Rate"
          value={currentEmissions ? `${(currentEmissions.fuel / 1000).toFixed(2)} L/s` : "0.00 L/s"}
          icon={Droplet}
        />
      </div>

      {/* Layout Grid: Heatmap Map vs Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Live pollution heatmap viewport */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassPanel className="p-6 relative rounded-[24px] overflow-hidden border border-brand-orange/15 min-h-[400px] flex flex-col justify-between">
            {/* Map container */}
            <div ref={mapRef} className="absolute inset-0 z-0 bg-[#120D09]" />

            {tileError && (
              <div className="absolute inset-0 bg-[#120D09]/92 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6 border border-eco-danger/30 rounded-[24px]">
                <AlertTriangle className="h-8 w-8 text-eco-danger animate-pulse" />
                <h4 className="font-bold text-[#FFF7ED] text-xs uppercase tracking-widest">Basemap unavailable</h4>
                <p className="text-[#CBB9A6] text-[11px] font-sans max-w-xs">Map tiles failed to load. The emissions heatmap overlay remains fully operational.</p>
                <button 
                  onClick={() => setTileError(false)} 
                  className="px-3 py-1 bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-[#FF8A00]/10 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all text-text-cream cursor-pointer pointer-events-auto animate-fade-in"
                >
                  Retry Map Tiles
                </button>
              </div>
            )}
            
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-35" />

            {/* Top Heatmap Settings bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
              <span className="px-3 py-1 bg-[#120D09]/85 border border-brand-orange/20 rounded-md font-mono text-[9px] uppercase tracking-widest text-brand-amber flex items-center gap-1.5 pointer-events-auto">
                <Layers className="h-3.5 w-3.5" />
                Live Emission Heatmap
              </span>
              
              {/* Toggle switch (CO2 vs NOx) */}
              <div className="flex bg-[#120D09]/85 border border-white/5 rounded-full p-1 gap-1 pointer-events-auto font-mono text-[8px] uppercase tracking-wider font-bold">
                <button
                  onClick={() => setActivePollutionType("co2")}
                  className={`px-3 py-1 rounded-full transition-colors ${activePollutionType === "co2" ? "bg-brand-orange text-[#120D09] font-bold" : "text-text-muted"}`}
                >
                  CO₂
                </button>
                <button
                  onClick={() => setActivePollutionType("nox")}
                  className={`px-3 py-1 rounded-full transition-colors ${activePollutionType === "nox" ? "bg-brand-orange text-[#120D09] font-bold" : "text-text-muted"}`}
                >
                  NOx
                </button>
              </div>
            </div>

            {/* Heatmap intensity Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-[#120D09]/85 border border-white/5 p-3 rounded-xl font-mono text-[8px] uppercase tracking-wider space-y-1.5 max-w-xs">
              <span className="text-text-muted font-bold block mb-1">Pollution Level</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FFD2A3]" />
                <span className="text-text-cream">LOW</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FFB84D]" />
                <span className="text-brand-amber">MODERATE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FF8A00]" />
                <span className="text-brand-orange">HIGH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FF4D4D]" />
                <span className="text-eco-danger">CRITICAL</span>
              </div>
            </div>

            {/* Geolocation Controls Panel */}
            <div className="absolute bottom-4 right-4 z-20 bg-[#120D09]/85 border border-white/5 p-3.5 rounded-xl font-mono text-[8px] uppercase tracking-wider space-y-3 max-w-[200px] pointer-events-auto shadow-xl">
              <span className="text-text-muted font-bold block mb-1">Geolocation</span>
              
              {geoLoading ? (
                <div className="flex items-center gap-2 text-brand-amber">
                  <span className="h-2 w-2 rounded-full bg-brand-orange animate-ping" />
                  <span>Detecting...</span>
                </div>
              ) : latitude !== null && longitude !== null ? (
                <div className="space-y-2">
                  <div className="text-[9px] text-[#FFF7ED] font-bold">📍 You are here</div>
                  <div className="text-[8px] text-text-pale lowercase tracking-normal truncate">
                    lat: {latitude.toFixed(4)}, lon: {longitude.toFixed(4)}
                  </div>
                  {Math.abs(latitude - CENTER_LAT) > 0.5 || Math.abs(longitude - CENTER_LNG) > 0.5 ? (
                    <div className="text-[7px] text-[#FFB84D] normal-case leading-normal">
                      Simulation network runs in Berlin, Germany.
                    </div>
                  ) : null}
                  <div className="flex gap-1 pt-1.5">
                    <button
                      onClick={() => mapInstanceRef.current?.flyTo([latitude, longitude], 16)}
                      className="flex-1 px-2 py-1 bg-white/5 hover:bg-[#FF8A00]/15 hover:border-brand-orange/40 border border-white/10 rounded text-[7px] font-bold uppercase transition-all cursor-pointer text-text-cream"
                    >
                      Show Me
                    </button>
                    <button
                      onClick={() => {
                        clearLocation();
                        if (userMarkerRef.current) userMarkerRef.current.remove();
                        if (userCircleRef.current) userCircleRef.current.remove();
                        mapInstanceRef.current?.flyTo([CENTER_LAT, CENTER_LNG], 16.5);
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-eco-danger/10 hover:border-eco-danger/40 border border-white/10 rounded text-[7px] font-bold uppercase transition-all cursor-pointer text-[#FF4D4D]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-text-pale text-[7px] leading-relaxed normal-case">
                    Enable location to show your position relative to simulation grids.
                  </div>
                  <button
                    onClick={detectLocation}
                    className="w-full py-1.5 bg-brand-orange hover:bg-brand-bright text-[#120D09] font-bold rounded-lg text-[8px] uppercase tracking-widest transition-all cursor-pointer shadow-md text-center"
                  >
                    Use My Location
                  </button>
                </div>
              )}

              {geoError && (
                <div className="space-y-1.5 p-2 bg-eco-danger/10 border border-eco-danger/20 rounded-lg text-[#FF4D4D] text-[8px] leading-relaxed normal-case">
                  <div className="font-bold uppercase tracking-wider text-[7px]">Error:</div>
                  <div>{geoError}</div>
                  <button
                    onClick={detectLocation}
                    className="mt-1 w-full py-1 bg-white/5 hover:bg-eco-danger/20 border border-[#FF4D4D]/20 rounded text-[7px] font-bold uppercase cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <button
                onClick={() => mapInstanceRef.current?.flyTo([CENTER_LAT, CENTER_LNG], 16.5)}
                className="w-full py-1.5 bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-[#FF8A00]/10 rounded-lg text-[7px] uppercase tracking-widest transition-all text-text-cream font-bold cursor-pointer text-center"
              >
                Jump to Simulation Area
              </button>
            </div>

            {/* Inactive overlay */}
            {!wsState.running && (
              <div className="absolute inset-0 bg-[#120D09]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6">
                <Leaf className="h-8 w-8 text-brand-orange animate-pulse" />
                <h4 className="font-bold text-[#FFF7ED] text-xs uppercase tracking-widest">Heatmap offline</h4>
                <p className="text-[#CBB9A6] text-[11px] font-sans max-w-xs">Start a SUMO simulation session to populate live spatial emission parameters.</p>
              </div>
            )}
          </GlassPanel>

          {/* Area trend graph */}
          <GlassChart title="CO₂ Emission Rate Trend" subtitle="Dynamic carbon dioxide dispersion output (mg/s)">
            {rateHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rateHistory}>
                  <defs>
                    <linearGradient id="colorCo2Intel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.16}/>
                      <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#A89582" tickLine={false} tick={{ fill: '#CBB9A6', fontSize: 8, fontFamily: 'monospace' }} />
                  <YAxis stroke="#A89582" tickLine={false} tick={{ fill: '#CBB9A6', fontSize: 8, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(18, 14, 11, 0.95)", border: "1px solid rgba(255, 184, 77, 0.25)", borderRadius: "8px", fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    name="CO₂ (mg/s)"
                    stroke="#FF8A00" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCo2Intel)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-brand-orange/15 rounded-xl font-mono">
                <span>Simulation not running. Telemetry history offline.</span>
              </div>
            )}
          </GlassChart>
        </div>

        {/* Right 1 Col: CPI & Hotspot lanes */}
        <div className="space-y-6">
          
          {/* CPI Score card */}
          <GlassCard variant="large" className="space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-[rgba(255,183,106,0.12)] pb-3">Carbon Pressure Index</h3>
            
            <div className={`p-4 rounded-xl border flex items-center justify-between ${cpi.color} font-mono`}>
              <div>
                <span className="text-[8px] uppercase font-bold tracking-widest opacity-80">cpi status</span>
                <div className="text-base font-black mt-0.5 tracking-wider">{cpi.status}</div>
              </div>
              <IconCpi className="h-6 w-6 stroke-[2]" />
            </div>

            <div className="space-y-3 text-xs text-text-pale leading-relaxed font-mono">
              <div className="flex justify-between items-center text-[9px] font-bold text-text-cream border-b border-[rgba(255,183,106,0.1)] pb-1.5 uppercase tracking-widest">
                <span>Index Contributors</span>
                <span>Score: {cpi.score.toFixed(0)}/100</span>
              </div>
              
              <div className="flex justify-between text-[11px]">
                <span>CO₂ emissions</span>
                <span className="font-bold text-text-cream">50% weight</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>NOx emissions</span>
                <span className="font-bold text-text-cream">30% weight</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Avg vehicle wait</span>
                <span className="font-bold text-text-cream">20% weight</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-[9px] text-text-muted flex gap-2 font-mono uppercase tracking-wider leading-normal">
              <Info className="h-4 w-4 text-text-muted shrink-0" />
              <span>Pressure score reflects local urban air quality parameters.</span>
            </div>
          </GlassCard>

          {/* Hotspots ranking list */}
          <GlassCard variant="large" className="space-y-4 flex flex-col justify-between h-[300px]">
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-text-muted mb-2 border-b border-[rgba(255,183,106,0.12)] pb-3">Emission Hotspots</h3>
              
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {isLoadingHotspots ? (
                  <div className="h-10 bg-white/5 rounded animate-pulse" />
                ) : hotspots && hotspots.length > 0 ? (
                  hotspots.map((lane, index) => (
                    <div key={lane} className="p-3 bg-[#24150B]/45 border border-[rgba(255,184,77,0.16)] rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-brand-orange/15 text-brand-orange font-bold text-[8px] flex items-center justify-center rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-text-cream">{lane.split('_')[0]}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange font-bold text-[8px] rounded uppercase tracking-wider">
                        Hotspot
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                    No hotspot corridors found.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(255,183,106,0.12)] text-center text-[9px] text-text-muted font-mono uppercase tracking-wider font-bold">
              Carbon Abatement pipeline active
            </div>
          </GlassCard>

        </div>
      </div>
      
    </div>
  );
}
