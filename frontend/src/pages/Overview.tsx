import { useSimulationStore } from "../store/simulationStore";
import { 
  Users, 
  Gauge, 
  Clock, 
  Leaf, 
  Activity, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ArrowRight
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  startSimulation, 
  pauseSimulation, 
  resumeSimulation, 
  stepSimulation, 
  stopSimulation, 
  getSimulationStatus 
} from "../api/simulation";
import { getSystemHealth } from "../api/health";
import { getRLStatus } from "../api/rl";
import { toast } from "../utils/toast";
import { webSocketService } from "../services/websocket";
import L from "leaflet";
import { GlassCard } from "../components/glass/GlassCard";
import { useLocationStore } from "../store/locationStore";
import { GlassButton } from "../components/glass/GlassButton";
import { GlassMetric } from "../components/glass/GlassMetric";
import { GlassChart } from "../components/glass/GlassChart";
import { SystemHealthResponse, RLStatus } from "../types";

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
  const [recentEvents, setRecentEvents] = useState<{ id: string; time: string; message: string }[]>([]);
  
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  
  const prevTimeRef = useRef<number>(0);
  const prevVehiclesCountRef = useRef<number>(0);
  const prevControllerRef = useRef<string>("");
  const prevRunningRef = useRef<boolean>(false);

  const { 
    latitude, 
    longitude, 
    accuracy,
    city,
    locality,
    formattedAddress,
    source,
    isDemoMode,
    setShowOnboardingModal
  } = useLocationStore();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const signalsRef = useRef<Record<string, L.CircleMarker>>({});

  // Query system health from actual backend status
  const { data: healthData, isError: healthError } = useQuery<SystemHealthResponse, Error>({
    queryKey: ["systemHealth"],
    queryFn: getSystemHealth,
    refetchInterval: 5000,
  });

  // Query PPO RL Status
  const { data: rlStatus } = useQuery<RLStatus, Error>({
    queryKey: ["rlStatus"],
    queryFn: getRLStatus,
    refetchInterval: 5000,
    enabled: wsState.running,
  });

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

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const data = await pauseSimulation();
      wsState.setSimulationStatus(data);
      return await getSimulationStatus();
    },
    onSuccess: (data) => {
      wsState.setSimulationStatus(data);
      toast("Simulation paused.", "info");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const data = await resumeSimulation();
      wsState.setSimulationStatus(data);
      return await getSimulationStatus();
    },
    onSuccess: (data) => {
      wsState.setSimulationStatus(data);
      toast("Simulation resumed.", "success");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stepMutation = useMutation({
    mutationFn: async () => {
      const data = await stepSimulation();
      wsState.setSimulationStatus(data);
      return await getSimulationStatus();
    },
    onSuccess: (data) => {
      wsState.setSimulationStatus(data);
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      return await stopSimulation();
    },
    onSuccess: (data) => {
      wsState.setSimulationStatus(data);
      webSocketService.disconnect();
      wsState.resetState();
      toast("Simulation stopped safely.", "info");
    },
    onError: (err: any) => {
      toast(err.message, "error");
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

  // Reset emissions history when simulation stops
  useEffect(() => {
    if (!wsState.running) {
      setEmissionsHistory([]);
    }
  }, [wsState.running]);

  // Derived Recent Activity Feed Log
  useEffect(() => {
    const newEvents: { id: string; time: string; message: string }[] = [];
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (wsState.running !== prevRunningRef.current) {
      if (wsState.running) {
        newEvents.push({ id: `run-${Date.now()}-1`, time: timestamp, message: "Simulation session started." });
      } else {
        newEvents.push({ id: `run-${Date.now()}-2`, time: timestamp, message: "Simulation session terminated." });
      }
      prevRunningRef.current = wsState.running;
    }

    if (wsState.running) {
      if (wsState.controller !== prevControllerRef.current) {
        newEvents.push({ id: `ctrl-${Date.now()}`, time: timestamp, message: `Signal controller changed to ${wsState.controller === "ppo" ? "PPO Reinforcement Learning" : "Fixed-Time Cycle"}.` });
        prevControllerRef.current = wsState.controller;
      }

      if (wsState.vehicles.length > prevVehiclesCountRef.current) {
        const diff = wsState.vehicles.length - prevVehiclesCountRef.current;
        newEvents.push({ id: `veh-in-${Date.now()}`, time: timestamp, message: `${diff} new vehicle(s) entered the network.` });
        prevVehiclesCountRef.current = wsState.vehicles.length;
      } else if (wsState.vehicles.length < prevVehiclesCountRef.current) {
        prevVehiclesCountRef.current = wsState.vehicles.length;
      }

      const delayedCount = wsState.vehicles.filter(v => v.waiting_time > 30).length;
      if (delayedCount > 0 && wsState.simulationTime % 10 === 0 && wsState.simulationTime !== prevTimeRef.current) {
        newEvents.push({ id: `delay-${Date.now()}`, time: timestamp, message: `Delay warning: ${delayedCount} vehicle(s) experiencing delays > 30s.` });
        prevTimeRef.current = wsState.simulationTime;
      }
    } else {
      prevVehiclesCountRef.current = 0;
      prevControllerRef.current = "";
    }

    if (newEvents.length > 0) {
      setRecentEvents(prev => [...newEvents, ...prev].slice(0, 10));
    }
  }, [wsState.running, wsState.vehicles, wsState.controller, wsState.simulationTime]);

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

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-cream max-w-7xl mx-auto w-full">
      
      {/* Title Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-[rgba(255,183,106,0.12)]">
        <div>
          <h1 
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#FFF8F0",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 18px rgba(0,0,0,0.45)"
            }}
            className="uppercase font-sans leading-tight"
          >
            EcoTwin Operations
          </h1>
          <p className="text-[#E8D7C5] text-xs mt-1 leading-relaxed max-w-xl font-sans font-normal">
            Real-time urban mobility and environmental intelligence.
          </p>
        </div>
        
        {/* System Health Indicators */}
        <div className="flex flex-wrap items-center gap-4 bg-[#140F0A]/75 border border-brand-orange/15 rounded-2xl px-5 py-2.5 font-mono text-[9px] uppercase tracking-wider shadow-lg">
          <span className="text-text-muted font-bold mr-1">System Health:</span>
          <div className="flex items-center gap-1.5" title="API Status">
            <span className={`h-2 w-2 rounded-full ${healthError ? "bg-eco-danger shadow-[0_0_8px_#FF4D4D]" : "bg-[#39D98A] shadow-[0_0_8px_#39D98A]"}`} />
            <span className="text-text-cream">API</span>
          </div>
          <div className="flex items-center gap-1.5" title="SUMO Simulator">
            <span className={`h-2 w-2 rounded-full ${healthData?.components.sumo === "healthy" ? "bg-[#39D98A] shadow-[0_0_8px_#39D98A]" : "bg-eco-danger shadow-[0_0_8px_#FF4D4D]"}`} />
            <span className="text-text-cream">SUMO</span>
          </div>
          <div className="flex items-center gap-1.5" title="TraCI Client">
            <span className={`h-2 w-2 rounded-full ${healthData?.components.traci === "healthy" ? "bg-[#39D98A] shadow-[0_0_8px_#39D98A]" : "bg-[#8D7868]/45"}`} />
            <span className="text-text-cream">TraCI</span>
          </div>
          <div className="flex items-center gap-1.5" title="PPO RL Agent">
            <span className={`h-2 w-2 rounded-full ${healthData?.components.ppo === "healthy" ? "bg-[#39D98A] shadow-[0_0_8px_#39D98A]" : "bg-[#8D7868]/45"}`} />
            <span className="text-text-cream">PPO</span>
          </div>
          <div className="flex items-center gap-1.5" title="WebSocket Telemetry Stream">
            <span className={`h-2 w-2 rounded-full ${wsState.connectionState === "connected" ? "bg-[#39D98A] shadow-[0_0_8px_#39D98A]" : wsState.connectionState === "connecting" ? "bg-[#FFB84D] shadow-[0_0_8px_#FFB84D]" : "bg-eco-danger shadow-[0_0_8px_#FF4D4D]"}`} />
            <span className="text-text-cream">WS</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassMetric
          label="Active Vehicles"
          value={wsState.running ? wsState.totalVehicles : "N/A"}
          icon={Users}
        />
        <GlassMetric
          label="Average Speed"
          value={wsState.running ? `${wsState.averageSpeed.toFixed(1)} km/h` : "N/A"}
          icon={Gauge}
        />
        <GlassMetric
          label="Avg Waiting Time"
          value={wsState.running ? `${wsState.averageWaitingTime.toFixed(1)} sec` : "N/A"}
          icon={Clock}
        />
        <GlassMetric
          label="Congestion Index"
          value={wsState.running ? `${getCongestionRate().toFixed(1)}%` : "N/A"}
          icon={Activity}
        />
      </div>

      {/* Main Operations Area (Map & Telemetry side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left: dominant Live Traffic Map (65-70% equivalent) */}
        <div className="lg:col-span-2 relative rounded-[24px] overflow-hidden border border-brand-orange/15 min-h-[420px] flex flex-col justify-between shadow-2xl bg-[#120D09]">
          {/* Map container */}
          <div ref={mapRef} className="absolute inset-0 z-0" />
          
          {/* Scanline atmospheric overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />

          {/* Top-Left Glass Overlay inside Map */}
          <div className="absolute top-4 left-4 z-20 px-3.5 py-2 bg-[#120D09]/85 backdrop-blur border border-brand-orange/20 rounded-xl font-mono text-[9px] uppercase tracking-widest text-[#FFF7ED] flex items-center gap-2 shadow-xl">
            <span className={`h-2 w-2 rounded-full ${wsState.running ? (wsState.paused ? "bg-[#FFB84D] animate-pulse" : "bg-[#39D98A] animate-ping") : "bg-eco-danger"}`} />
            <span>Live Traffic Network: {wsState.running ? (wsState.paused ? "PAUSED" : "RUNNING") : "OFFLINE"}</span>
          </div>

          {/* Bottom-Left Legend Overlay inside Map */}
          <div className="absolute bottom-4 left-4 z-20 p-3 bg-[#120D09]/85 backdrop-blur border border-white/5 rounded-xl font-mono text-[8px] uppercase tracking-wider space-y-1.5 shadow-xl text-text-pale">
            <div className="font-bold text-text-muted mb-1 text-[7px]">Traffic Load Legend</div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#39D98A]" />
              <span>Low Traffic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FFB84D]" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF8A00]" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#FF4D4D]" />
              <span>Critical</span>
            </div>
          </div>

          {/* Right Geolocation panel (Jump controls) */}
          <div className="absolute top-4 right-4 z-20 bg-[#120D09]/90 backdrop-blur-md border border-[#FF8A00]/25 p-3 rounded-xl font-mono text-[8px] uppercase tracking-wider space-y-2 max-w-[200px] pointer-events-auto shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-text-muted font-bold block">Target Location</span>
              <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-[#FF8A00]/15 text-[#FF8A00] border border-[#FF8A00]/30">
                {source}
              </span>
            </div>

            {latitude !== null && longitude !== null ? (
              <div className="space-y-1">
                <div className="text-[9px] text-[#FFF7ED] font-bold truncate">
                  📍 {city || locality || "Target Region"}
                </div>
                <div className="text-[7px] text-text-pale lowercase tracking-normal truncate">
                  {formattedAddress || `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}`}
                </div>
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => mapInstanceRef.current?.flyTo([latitude, longitude], 16)}
                    className="flex-1 py-1 bg-white/5 hover:bg-[#FF8A00]/20 hover:border-[#FF8A00]/40 border border-white/10 rounded text-[7px] font-bold uppercase transition-all cursor-pointer text-text-cream"
                  >
                    Center Map
                  </button>
                  <button
                    onClick={() => setShowOnboardingModal(true)}
                    className="py-1 px-2 bg-[#FF8A00]/15 hover:bg-[#FF8A00]/30 border border-[#FF8A00]/30 rounded text-[7px] font-bold uppercase transition-all cursor-pointer text-[#FF8A00]"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-text-pale text-[7px] leading-relaxed normal-case">
                  Target location not set.
                </div>
                <button
                  onClick={() => setShowOnboardingModal(true)}
                  className="w-full py-1 bg-[#FF8A00] text-black rounded text-[8px] font-bold uppercase cursor-pointer"
                >
                  Set Location
                </button>
              </div>
            )}

            {isDemoMode && (
              <div className="border-t border-white/10 pt-1.5 text-[7px] text-[#FFB84D] font-bold">
                ⚡ BENCHMARK DEMO GRID (BERLIN MITTE)
              </div>
            )}
          </div>

          {tileError && (
            <div className="absolute inset-0 bg-[#120D09]/92 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6 border border-eco-danger/30 rounded-[24px]">
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
            <div className="absolute inset-0 bg-[#120D09]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6 rounded-[24px]">
              <Leaf className="h-8 w-8 text-brand-orange animate-pulse" />
              <h4 className="font-bold text-[#FFF7ED] text-xs uppercase tracking-widest">Digital Twin Offline</h4>
              <p className="text-[#CBB9A6] text-[11px] font-sans max-w-xs">Start a SUMO simulation session to view live vehicle coordinates and junction states.</p>
            </div>
          )}
        </div>

        {/* Right: Network Telemetry Panel (30-35% equivalent) */}
        <GlassCard className="flex flex-col justify-between p-5 min-h-[420px]">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="border-b border-[rgba(255,183,106,0.12)] pb-3">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">Live Diagnostics</span>
              <h3 className="text-xs font-bold uppercase font-mono text-text-cream">Network Telemetry</h3>
            </div>
            
            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-3.5 py-1">
              <div>
                <span className="text-[8px] uppercase tracking-wider font-mono text-text-pale font-bold block">Active Vehicles</span>
                <span className="font-mono text-sm font-bold text-[#FFF7ED] mt-0.5 block">{wsState.running ? wsState.totalVehicles : "0"} qty</span>
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-wider font-mono text-text-pale font-bold block">Avg Speed</span>
                <span className="font-mono text-sm font-bold text-[#FFF7ED] mt-0.5 block">{wsState.running ? `${wsState.averageSpeed.toFixed(1)}` : "0.0"} km/h</span>
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-wider font-mono text-text-pale font-bold block">Waiting Time</span>
                <span className="font-mono text-sm font-bold text-[#FFF7ED] mt-0.5 block">{wsState.running ? `${wsState.averageWaitingTime.toFixed(1)}` : "0.0"} s</span>
              </div>
              <div>
                <span className="text-[8px] uppercase tracking-wider font-mono text-text-pale font-bold block">Congestion Index</span>
                <span className="font-mono text-sm font-bold text-[#FFF7ED] mt-0.5 block">{wsState.running ? `${getCongestionRate().toFixed(1)}` : "0.0"}%</span>
              </div>
            </div>

            {/* Recent Activity feed */}
            <div className="border-t border-[rgba(255,183,106,0.12)] pt-3 flex-1 flex flex-col">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block mb-2">Recent Activity</span>
              <div className="space-y-1.5 overflow-y-auto max-h-[160px] flex-1 pr-1 scrollbar-thin">
                {recentEvents.length > 0 ? (
                  recentEvents.map(e => (
                    <div key={e.id} className="p-2 bg-[#24150B]/35 border border-[#FFB84D]/10 rounded-lg flex gap-2 items-start text-[10px] font-mono leading-normal">
                      <span className="text-[#A89582] shrink-0 text-[8px] pt-0.5">[{e.time}]</span>
                      <span className="text-[#FFF7ED]">{e.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-text-muted text-[10px] font-mono border border-dashed border-brand-orange/15 rounded-lg py-6 text-center">
                    No recent network events.
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Section 2: Emissions Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left: CO2 Emission Trend Chart (65-70% equivalent) */}
        <div className="lg:col-span-2">
          <GlassChart title="CO₂ Emission Trend" subtitle="Real-time CO₂ rate flow in the traffic network (measured in mg/s)">
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
                    name="CO₂ (mg/s)"
                    stroke="#FF8A00" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCo2Overview)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-brand-orange/15 rounded-xl font-mono">
                {wsState.running ? (
                  <span>Synchronizing live telemetry chart...</span>
                ) : (
                  <span>Simulation not running. Telemetry offline.</span>
                )}
              </div>
            )}
          </GlassChart>
        </div>

        {/* Right: Emission Summary panel */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[rgba(255,183,106,0.12)] pb-3">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">Environmental Metrics</span>
              <h3 className="text-xs font-bold uppercase font-mono text-text-cream">Emission Summary</h3>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-text-pale">Current CO₂ rate:</span>
                <span className="font-bold text-brand-orange">{wsState.running ? `${wsState.co2.toFixed(0)} mg/s` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-text-pale">Current NOx rate:</span>
                <span className="font-bold text-brand-orange">{wsState.running ? `${wsState.nox.toFixed(1)} mg/s` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-text-pale">Current Fuel rate:</span>
                <span className="font-bold text-brand-orange">{wsState.running ? `${wsState.fuel.toFixed(1)} ml/s` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-text-pale">Emission Status:</span>
                <span className={`font-bold uppercase ${wsState.running ? (wsState.co2 > 10000 ? "text-[#FF4D4D] animate-pulse" : "text-[#39D98A]") : "text-text-muted"}`}>
                  {wsState.running ? (wsState.co2 > 10000 ? "⚠️ Critical Hotspots" : "● Stable") : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-[rgba(255,183,106,0.12)] text-right">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/carbon")}
              className="uppercase tracking-widest text-[9px] font-mono px-3.5 py-1.5"
            >
              Open Carbon Intelligence <ArrowRight className="h-3 w-3 ml-1" />
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Section 3: Traffic Control & RL Control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Traffic Control */}
        <GlassCard className="p-5 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-4">
            <div className="border-b border-[rgba(255,183,106,0.12)] pb-3">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">Signal Operations</span>
              <h3 className="text-xs font-bold uppercase font-mono text-text-cream">Traffic Control</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-text-pale">Active Intersections:</span>
                <span className="font-bold text-text-cream">{wsState.running ? wsState.trafficLights.length : 0} nodes</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-text-pale">Active Controller:</span>
                <span className="font-bold text-brand-orange uppercase">{wsState.running ? (wsState.controller === "ppo" ? "PPO RL Optimizer" : "Fixed-Time Cycle") : "N/A"}</span>
              </div>
              
              {/* Traffic lights list */}
              <div className="space-y-1.5 pt-1.5">
                <span className="text-[8px] text-text-muted uppercase block font-bold">Signal State Details</span>
                {wsState.running && wsState.trafficLights.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1">
                    {wsState.trafficLights.map(tls => {
                      const isGreen = tls.active_phase === 0 || tls.active_phase === 2;
                      const isYellow = tls.active_phase === 1 || tls.active_phase === 3;
                      const signalLabel = isGreen ? "Green Phase" : isYellow ? "Yellow Phase" : "Red Phase";
                      const signalColorClass = isGreen ? "text-[#39D98A]" : isYellow ? "text-[#FFB84D]" : "text-[#FF4D4D]";

                      return (
                        <div key={tls.id} className="p-1.5 bg-[#120D09]/45 border border-[#FFB84D]/10 rounded flex justify-between items-center text-[9px]">
                          <span>ID: {tls.id}</span>
                          <span className={`font-bold ${signalColorClass}`}>{signalLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-text-muted text-[10px] py-4 text-center border border-dashed border-brand-orange/15 rounded-lg">
                    No active traffic lights detected.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-[rgba(255,183,106,0.12)] text-right mt-4">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/traffic")}
              className="uppercase tracking-widest text-[9px] font-mono px-3.5 py-1.5"
            >
              Open Traffic Network <ArrowRight className="h-3 w-3 ml-1" />
            </GlassButton>
          </div>
        </GlassCard>

        {/* Right: RL Control */}
        <GlassCard className="p-5 flex flex-col justify-between min-h-[220px]">
          <div className="space-y-4">
            <div className="border-b border-[rgba(255,183,106,0.12)] pb-3">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">Agent Performance</span>
              <h3 className="text-xs font-bold uppercase font-mono text-text-cream">RL Control</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-text-pale">RL Optimizer Status:</span>
                <span className={`font-bold uppercase ${wsState.running && wsState.controller === "ppo" ? "text-[#39D98A]" : "text-text-muted"}`}>
                  {wsState.running && wsState.controller === "ppo" ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-text-pale">Active Model:</span>
                <span className="font-bold text-text-cream truncate max-w-[150px]">{wsState.running && wsState.controller === "ppo" ? (rlStatus?.model_version || "PPO_Policy") : "None"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-text-pale">Inference Latency:</span>
                <span className="font-bold text-text-cream">{wsState.running && wsState.controller === "ppo" && rlStatus?.latency_ms ? `${rlStatus.latency_ms.toFixed(1)} ms` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-text-pale">Step Reward:</span>
                <span className="font-bold text-brand-orange">{wsState.running && wsState.controller === "ppo" && rlStatus?.mean_reward ? `${rlStatus.mean_reward.toFixed(2)}` : "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-[rgba(255,183,106,0.12)] text-right mt-4">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/rl")}
              className="uppercase tracking-widest text-[9px] font-mono px-3.5 py-1.5"
            >
              Open RL Control <ArrowRight className="h-3 w-3 ml-1" />
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Environmental Intelligence */}
      <GlassCard className="p-5">
        <div className="border-b border-[rgba(255,183,106,0.12)] pb-3 mb-4">
          <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">Environmental Analysis</span>
          <h3 className="text-xs font-bold uppercase font-mono text-text-cream">Environmental Intelligence</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="bg-[#24150B]/35 border border-[#FFB84D]/10 rounded-xl p-3.5">
            <span className="text-text-pale text-[10px] uppercase font-bold block">Air Quality Index</span>
            <div className="font-bold text-sm text-[#39D98A] mt-1">● GOOD (AQI: 42)</div>
            <p className="text-[9px] text-text-muted mt-1 leading-normal font-sans">CO₂ and NOx concentrations are within nominal safety thresholds in all sectors.</p>
          </div>
          <div className="bg-[#24150B]/35 border border-[#FFB84D]/10 rounded-xl p-3.5">
            <span className="text-text-pale text-[10px] uppercase font-bold block">Primary Pollutant</span>
            <div className="font-bold text-sm text-brand-orange mt-1">NO₂ / CO₂</div>
            <p className="text-[9px] text-text-muted mt-1 leading-normal font-sans">Nitrogen oxides remain the primary local combustion pollutant near central arterial links.</p>
          </div>
          <div className="bg-[#24150B]/35 border border-[#FFB84D]/10 rounded-xl p-3.5">
            <span className="text-text-pale text-[10px] uppercase font-bold block">Sector Hotspots</span>
            <div className="font-bold text-sm text-[#39D98A] mt-1">0 Active Hotspots</div>
            <p className="text-[9px] text-text-muted mt-1 leading-normal font-sans">No sectors currently exceed the critical CO₂ hotspot density threshold (12.0g/s).</p>
          </div>
        </div>
      </GlassCard>

      {/* Bottom Grid: Quick Actions & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Quick Actions Panel */}
        <GlassCard className="p-5 flex flex-col justify-between lg:col-span-1 min-h-[160px]">
          <div className="space-y-4">
            <div className="border-b border-[rgba(255,183,106,0.12)] pb-3">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">System Actions</span>
              <h3 className="text-xs font-bold uppercase font-mono text-text-cream">Quick Actions</h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {!wsState.running ? (
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-bright disabled:opacity-50 text-[#050505] font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{startMutation.isPending ? "Starting..." : "Start Simulation"}</span>
                </button>
              ) : (
                <>
                  {wsState.paused ? (
                    <button
                      onClick={() => resumeMutation.mutate()}
                      disabled={resumeMutation.isPending}
                      className="px-4 py-2 bg-brand-orange hover:bg-brand-bright disabled:opacity-50 text-[#050505] font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => pauseMutation.mutate()}
                      disabled={pauseMutation.isPending}
                      className="px-4 py-2 bg-[#FFB84D] hover:bg-[#FFE7CC] disabled:opacity-50 text-[#050505] font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <Pause className="h-3 w-3 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => stepMutation.mutate()}
                    disabled={stepMutation.isPending}
                    className="px-3.5 py-2 bg-white/5 border border-white/10 hover:border-brand-orange/40 hover:bg-[#FF8A00]/10 disabled:opacity-50 text-text-cream font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span>Step</span>
                  </button>

                  <button
                    onClick={() => stopMutation.mutate()}
                    disabled={stopMutation.isPending}
                    className="px-4 py-2 bg-eco-danger hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Comparison / Analytics Preview */}
        <GlassCard className="p-5 flex flex-col justify-between lg:col-span-2 min-h-[160px]">
          <div className="space-y-4">
            <div className="border-b border-[rgba(255,183,106,0.12)] pb-3">
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted font-bold block">Optimization Analytics</span>
              <h3 className="text-xs font-bold uppercase font-mono text-text-cream">Baseline vs PPO Optimization</h3>
            </div>
            
            <p className="text-[11px] text-text-pale leading-normal font-sans">
              No active comparison runs available yet. Run baseline and PPO simulation runs to see optimized city comparison metrics.
            </p>
          </div>
          <div className="pt-3 border-t border-[rgba(255,183,106,0.12)] text-right">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => navigate("/compare")}
              className="uppercase tracking-widest text-[9px] font-mono px-3.5 py-1.5"
            >
              Open Comparison Analytics <ArrowRight className="h-3 w-3 ml-1" />
            </GlassButton>
          </div>
        </GlassCard>
      </div>
      
    </div>
  );
}
