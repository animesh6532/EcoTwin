import { useSimulationStore } from "../store/simulationStore";
import { 
  Users, 
  Gauge, 
  Clock, 
  Leaf, 
  Activity, 
  AlertTriangle,
  Play
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { startSimulation, resumeSimulation, getSimulationStatus } from "../api/simulation";
import { toast } from "../utils/toast";
import { webSocketService } from "../services/websocket";
import L from "leaflet";
import { GlassCard } from "../components/glass/GlassCard";
import { useGeolocation } from "../hooks/useGeolocation";
import { GlassPanel } from "../components/glass/GlassPanel";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassMetric } from "../components/glass/GlassMetric";
import { GlassChart } from "../components/glass/GlassChart";
import { GlassStatus } from "../components/glass/GlassStatus";

const CENTER_LAT = 52.5200;
const CENTER_LNG = 13.4050;

function sumoToLatLng(x: number, y: number): [number, number] {
  const lat = CENTER_LAT + (y / 111320);
  const lng = CENTER_LNG + (x / (111320 * Math.cos(CENTER_LAT * Math.PI / 180)));
  return [lat, lng];
}

export default function Overview() {
  const wsState = useSimulationStore();
  const [emissionsHistory, setEmissionsHistory] = useState<{ time: string; co2: number }[]>([]);
  const [tileError, setTileError] = useState(false);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const { 
    latitude, 
    longitude, 
    accuracy, 
    loading: geoLoading, 
    error: geoError, 
    detectLocation, 
    clearLocation 
  } = useGeolocation();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const signalsRef = useRef<Record<string, L.CircleMarker>>({});

  // Start simulation mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      const startData = await startSimulation({
        scenario: "normal",
        gui: false,
        duration: 1000,
        step_length: 1.0,
        controller: "fixed_time",
      });
      wsState.setSimulationStatus(startData);

      const resumeData = await resumeSimulation();
      wsState.setSimulationStatus(resumeData);

      const statusData = await getSimulationStatus();
      wsState.setSimulationStatus(statusData);

      return statusData;
    },
    onSuccess: async () => {
      await wsState.fetchSimulationMetrics();
      webSocketService.connect();
      toast("Simulation started.", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to start simulation.", "error");
    }
  });

  // Maintain emissions history
  useEffect(() => {
    if (wsState.running && wsState.co2 > 0) {
      setEmissionsHistory((prev) => {
        const timeStr = `${wsState.simulationTime.toFixed(0)}s`;
        if (prev.length > 0 && prev[prev.length - 1].time === timeStr) {
          return prev;
        }
        const next = [...prev, { time: timeStr, co2: wsState.co2 }];
        return next.slice(-20);
      });
    }
  }, [wsState.simulationTime, wsState.co2, wsState.running]);

  // Telemetry map rendering
  // Initialize Map on mount
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: false,
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

    // Road lines
    const lineOptions = { color: "#3A2110", weight: 6, opacity: 0.5 };
    L.polyline([sumoToLatLng(0, -500), sumoToLatLng(0, 500)], lineOptions).addTo(map);
    L.polyline([sumoToLatLng(-500, 0), sumoToLatLng(500, 0)], lineOptions).addTo(map);

    // Junction box
    L.rectangle([sumoToLatLng(-22, -22), sumoToLatLng(22, 22)], {
      color: "#FF8A00",
      weight: 1,
      fillColor: "#FF8A00",
      fillOpacity: 0.05,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
      signalsRef.current = {};
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

  // Update vehicle markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const activeIds = new Set(wsState.vehicles.map((v) => v.id));

    // Remove old
    Object.keys(markersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Draw active
    wsState.vehicles.forEach((v) => {
      const latlng = sumoToLatLng(v.x, v.y);
      let marker = markersRef.current[v.id];

      let markerColor = "#FF8A00";
      if (v.id.includes("electric")) markerColor = "#FFE7CC";
      else if (v.id.includes("truck")) markerColor = "#E06C00";

      if (!marker) {
        marker = L.circleMarker(latlng, {
          radius: 3.5,
          fillColor: markerColor,
          fillOpacity: 0.95,
          color: "#050505",
          weight: 1,
        }).addTo(map);
        markersRef.current[v.id] = marker;
      } else {
        marker.setLatLng(latlng);
      }
    });
  }, [wsState.vehicles]);

  // Update signals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    wsState.trafficLights.forEach((tls) => {
      const pos = sumoToLatLng(0, 0);
      let signalMarker = signalsRef.current[tls.id];

      const isGreen = tls.active_phase === 0 || tls.active_phase === 2;
      const isYellow = tls.active_phase === 1 || tls.active_phase === 3;
      const signalColor = isGreen ? "#39D98A" : isYellow ? "#FFB84D" : "#FF4D4D";

      if (!signalMarker) {
        signalMarker = L.circleMarker(pos, {
          radius: 6,
          fillColor: signalColor,
          fillOpacity: 0.95,
          color: "#050505",
          weight: 1.5,
        }).addTo(map);
        signalsRef.current[tls.id] = signalMarker;
      } else {
        signalMarker.setStyle({ fillColor: signalColor });
      }
    });
  }, [wsState.trafficLights]);

  // Congestion calculation
  const getCongestionRate = () => {
    if (!wsState.running || wsState.totalVehicles === 0) return 0;
    const slowVehicles = wsState.vehicles.filter((v) => v.speed < 10).length;
    return (slowVehicles / wsState.totalVehicles) * 100;
  };

  // Simulation Inactive state (Redesigned Onboarding)
  if (!wsState.running) {
    return (
      <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-14rem)]">
        <GlassPanel className="max-w-xl w-full text-center space-y-6">
          <div className="relative flex items-center justify-center h-12 w-12 mx-auto">
            <div className="absolute inset-0 bg-brand-orange/20 blur-lg rounded-full" />
            <Leaf className="h-8 w-8 text-brand-orange relative z-10 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-text-cream tracking-widest uppercase font-mono">
              DIGITAL TWIN OFFLINE
            </h3>
            <p className="text-text-pale text-xs leading-relaxed max-w-sm mx-auto">
              Start a SUMO simulation to activate live traffic intelligence and dynamic emissions profiling.
            </p>
          </div>

          <div className="pt-2">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="mx-auto uppercase tracking-widest text-xs"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              <span>{startMutation.isPending ? "Configuring..." : "Start Simulation"}</span>
            </GlassButton>
          </div>

          {/* Quick status grids */}
          <div className="border-t border-[rgba(255,183,106,0.12)] pt-6 flex justify-center gap-6 text-[10px] font-mono uppercase tracking-wider text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${wsState.sumoStatus === "healthy" ? "bg-[#39D98A]" : "bg-[#8D7868]/45"}`} />
              <span>SUMO</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${wsState.traciStatus === "healthy" ? "bg-[#39D98A]" : "bg-[#8D7868]/45"}`} />
              <span>TraCI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${wsState.ppoStatus === "healthy" ? "bg-[#39D98A]" : "bg-[#8D7868]/45"}`} />
              <span>PPO</span>
            </div>
          </div>
        </GlassPanel>
      </div>
    );
  }

  // Active metrics mapping
  const metricsList = [
    { label: "Active Vehicles", value: wsState.totalVehicles, unit: "qty", icon: Users },
    { label: "Average Speed", value: `${wsState.averageSpeed.toFixed(1)}`, unit: "km/h", icon: Gauge },
    { label: "Avg Waiting Time", value: `${wsState.averageWaitingTime.toFixed(1)}`, unit: "sec", icon: Clock },
    { label: "Congestion Index", value: `${getCongestionRate().toFixed(1)}`, unit: "%", icon: Activity },
  ];

  const delayedVehicles = wsState.vehicles
    .filter((v) => v.waiting_time > 30)
    .sort((a, b) => b.waiting_time - a.waiting_time)
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in text-text-cream">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: "#FFF8F0",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 18px rgba(0,0,0,0.45)"
            }}
            className="uppercase font-sans leading-tight"
          >
            EcoTwin Operations
          </h1>
          <p className="text-[#E8D7C5] text-sm mt-2 leading-relaxed max-w-xl font-sans font-normal">
            Real-time urban mobility and environmental intelligence.
          </p>
        </div>
        
        {/* Top Mini status bar */}
        <div className="flex flex-wrap items-center gap-3">
          <GlassStatus label="SYS STATE" status="RUNNING" />
          <GlassStatus label="CONNECTION" status={wsState.connectionState === "connected" ? "connected" : "connecting"} />
          <GlassStatus label="CONTROLLER" status={wsState.controller === "ppo" ? "PPO RL" : "Fixed-Time"} />
        </div>
      </div>

      {/* Hero Telemetry Panel Redesign */}
      <GlassPanel className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Left Side: Dynamic Metrics stack */}
        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-2 pb-2 border-b border-[rgba(255,183,106,0.12)]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted font-bold block">Live Telemetry Stats</span>
            <h2 className="text-sm font-bold uppercase font-mono">Operations Feed</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {metricsList.map((m, idx) => (
              <GlassMetric
                key={idx}
                label={m.label}
                value={m.value}
                icon={m.icon}
              />
            ))}
          </div>
        </div>

        {/* Center / Right: Live digital twin tracking viewport */}
        <div className="lg:col-span-2 relative rounded-[18px] overflow-hidden border border-brand-orange/15 min-h-[300px] flex flex-col justify-between">
          {/* Map wrapper */}
          <div ref={mapRef} className="absolute inset-0 z-0 bg-[#120D09]" />
          
          {/* Scanline atmospheric overlays */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />
          
          {/* Viewport overlay labels */}
          <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#120D09]/85 border border-brand-orange/20 rounded-md font-mono text-[9px] uppercase tracking-widest text-brand-amber flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-ping" />
            Live digital twin map
          </div>
          
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-[#120D09]/85 border border-white/5 rounded-md font-mono text-[9px] uppercase tracking-widest text-[#FFF7ED]">
            SIMULATION STEP: {(wsState.simulationTime).toFixed(0)}s
          </div>

          {tileError && (
            <div className="absolute inset-0 bg-[#120D09]/92 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6 border border-eco-danger/30">
              <AlertTriangle className="h-8 w-8 text-eco-danger animate-pulse" />
              <h4 className="font-bold text-[#FFF7ED] text-xs uppercase tracking-widest">Basemap unavailable</h4>
              <p className="text-[#CBB9A6] text-[11px] font-sans max-w-xs">Map tiles failed to load. The simulation metrics remain fully operational.</p>
              <button 
                onClick={() => setTileError(false)} 
                className="px-3 py-1 bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-[#FF8A00]/10 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all text-text-cream cursor-pointer pointer-events-auto"
              >
                Retry Map Tiles
              </button>
            </div>
          )}

          {!wsState.running && (
            <div className="absolute inset-0 bg-[#120D09]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6">
              <Leaf className="h-8 w-8 text-brand-orange animate-pulse" />
              <h4 className="font-bold text-[#FFF7ED] text-xs uppercase tracking-widest">Digital Twin Offline</h4>
              <p className="text-[#CBB9A6] text-[11px] font-sans max-w-xs">Start a SUMO simulation session to view live vehicle coordinates and junction states.</p>
            </div>
          )}

          {/* Geolocation Controls Panel */}
          <div className="absolute top-4 right-4 z-20 bg-[#120D09]/85 border border-white/5 p-3.5 rounded-xl font-mono text-[8px] uppercase tracking-wider space-y-3 max-w-[200px] pointer-events-auto shadow-xl">
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
                      mapInstanceRef.current?.flyTo([CENTER_LAT, CENTER_LNG], 16);
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
              onClick={() => mapInstanceRef.current?.flyTo([CENTER_LAT, CENTER_LNG], 16)}
              className="w-full py-1.5 bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-[#FF8A00]/10 rounded-lg text-[7px] uppercase tracking-widest transition-all text-text-cream font-bold cursor-pointer text-center"
            >
              Jump to Simulation Area
            </button>
          </div>
        </div>
      </GlassPanel>

      {/* Main Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Carbon Dispersion Chart */}
        <div className="lg:col-span-2">
          <GlassChart title="CO₂ Emission Dispersion" subtitle="Real-time CO₂ rate flow in the traffic network (measured in mg/s)">
            {emissionsHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={emissionsHistory}>
                  <defs>
                    <linearGradient id="colorCo2Overview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#A89582" tickLine={false} tick={{ fill: '#CBB9A6', fontSize: 9, fontFamily: 'monospace' }} />
                  <YAxis stroke="#A89582" tickLine={false} tick={{ fill: '#CBB9A6', fontSize: 9, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(18, 14, 11, 0.95)", border: "1px solid rgba(255, 184, 77, 0.25)", borderRadius: "12px", fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#FF8A00" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCo2Overview)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-brand-orange/15 rounded-xl font-mono">
                <span>Synchronizing live telemetry chart...</span>
              </div>
            )}
          </GlassChart>
        </div>

        {/* Right 1 Col: Delay alerts warnings */}
        <GlassCard variant="large" className="flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[rgba(255,183,106,0.12)] pb-3">
              <AlertTriangle className="h-4.5 w-4.5 text-eco-danger" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Delay Alerts</h3>
            </div>
            
            <p className="text-[11px] text-text-pale leading-normal font-sans">
              Active vehicles experiencing grid queue delays &gt; 30 seconds.
            </p>

            <div className="space-y-2">
              {delayedVehicles.length > 0 ? (
                delayedVehicles.map((v) => (
                  <div 
                    key={v.id} 
                    className="p-2.5 bg-[#24150B]/45 rounded-lg border border-[rgba(255,184,77,0.16)] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-semibold text-text-cream">ID: {v.id}</div>
                      <div className="text-[9px] text-text-muted mt-0.5 font-mono">LANE: {v.lane_id.split('_')[0]}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-orange">{v.waiting_time.toFixed(0)}s</div>
                      <div className="text-[9px] text-text-muted mt-0.5">WAITING</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                  No delays detected in network.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(255,183,106,0.12)] text-center text-[9px] text-text-muted font-mono uppercase tracking-wider">
            SUMO Event Loop Synchronized
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
