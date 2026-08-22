import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSimulationStore } from "../store/simulationStore";
import { 
  startSimulation, 
  pauseSimulation, 
  resumeSimulation, 
  stepSimulation, 
  stopSimulation, 
  getSimulationStatus 
} from "../api/simulation";
import { webSocketService } from "../services/websocket";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Info, 
  Search,
  Sliders,
  Settings,
  Activity,
  Users
} from "lucide-react";
import { toast } from "../utils/toast";
import { SimulationStatus } from "../types";
import { GlassCard } from "../components/glass/GlassCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const CENTER_LAT = 52.5200;
const CENTER_LNG = 13.4050;

function sumoToLatLng(x: number, y: number): [number, number] {
  const lat = CENTER_LAT + (y / 111320);
  const lng = CENTER_LNG + (x / (111320 * Math.cos(CENTER_LAT * Math.PI / 180)));
  return [lat, lng];
}

export default function Simulation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const signalsRef = useRef<Record<string, L.CircleMarker>>({});
  const gridCellsRef = useRef<L.Rectangle[]>([]);

  const {
    running,
    paused,
    simulationTime,
    vehicles,
    trafficLights,
    pollution,
    selectedVehicleId,
    selectVehicle,
    selectIntersection,
    setSimulationStatus,
    resetState,
    fetchSimulationMetrics,
    averageSpeed,
    averageWaitingTime,
    co2,
  } = useSimulationStore();

  // Keep a local timeline history of the active session
  const [timelineHistory, setTimelineHistory] = useState<{
    step: string;
    vehicles: number;
    speed: number;
    delay: number;
    co2: number;
  }[]>([]);

  // Settings configuration state
  const [scenario, setScenario] = useState("normal");
  const [runGui, setRunGui] = useState(false);
  const [maxSteps, setMaxSteps] = useState(1000);
  const [stepLength, setStepLength] = useState(1.0);
  const [initController, setInitController] = useState("fixed_time");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  // Sync initial status on mount
  const { data: simStatus } = useQuery<SimulationStatus, Error>({
    queryKey: ["simStatus"],
    queryFn: getSimulationStatus,
  });

  useEffect(() => {
    if (simStatus) {
      setSimulationStatus(simStatus);
      if (simStatus.running) {
        webSocketService.connect();
      }
    }
  }, [simStatus, setSimulationStatus]);

  // Sync timeline history
  useEffect(() => {
    if (running && vehicles.length > 0) {
      setTimelineHistory((prev) => {
        const stepStr = `${simulationTime.toFixed(0)}s`;
        if (prev.length > 0 && prev[prev.length - 1].step === stepStr) {
          return prev;
        }
        const next = [
          ...prev,
          {
            step: stepStr,
            vehicles: vehicles.length,
            speed: averageSpeed || 25,
            delay: averageWaitingTime || 10,
            co2: co2 ? co2 / 1000 : 5, // in grams
          }
        ];
        return next.slice(-30); // Keep last 30 frames
      });
    }
  }, [simulationTime, running, vehicles.length, averageSpeed, averageWaitingTime, co2]);

  // Reset timeline when simulation stops
  useEffect(() => {
    if (!running) {
      setTimelineHistory([]);
    }
  }, [running]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      maxZoom: 18,
      minZoom: 14,
    }).setView([CENTER_LAT, CENTER_LNG], 16);

    // Dark Matter basemap
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Reference roads
    const lineOptions = { color: "#2A170C", weight: 8, opacity: 0.6 };
    L.polyline([sumoToLatLng(0, -500), sumoToLatLng(0, 500)], lineOptions).addTo(map);
    L.polyline([sumoToLatLng(-500, 0), sumoToLatLng(500, 0)], lineOptions).addTo(map);

    // Central junction boundaries
    const centerBounds: [[number, number], [number, number]] = [
      sumoToLatLng(-25, -25),
      sumoToLatLng(25, 25)
    ];
    L.rectangle(centerBounds, {
      color: "#FF8A00",
      weight: 1.5,
      fillColor: "#FF8A00",
      fillOpacity: 0.06,
    }).addTo(map).on("click", () => {
      selectIntersection("center");
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectIntersection]);

  // Update Pollution Grid
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    gridCellsRef.current.forEach((cell) => cell.remove());
    gridCellsRef.current = [];

    pollution.forEach((cell) => {
      const halfSize = 25;
      const bounds: [[number, number], [number, number]] = [
        sumoToLatLng(cell.x - halfSize, cell.y - halfSize),
        sumoToLatLng(cell.x + halfSize, cell.y + halfSize)
      ];

      let fillColor = "#FFD2A3";
      if (cell.intensity > 0.8) fillColor = "#FF4D4D";
      else if (cell.intensity > 0.6) fillColor = "#FF8A00";
      else if (cell.intensity > 0.3) fillColor = "#FFB84D";

      const rect = L.rectangle(bounds, {
        stroke: false,
        fillColor: fillColor,
        fillOpacity: cell.intensity * 0.35,
      }).addTo(map);

      rect.on("click", () => {
        toast(`Corridor hotspot: Intensity ${(cell.intensity * 100).toFixed(0)}%`, "info");
      });

      gridCellsRef.current.push(rect);
    });
  }, [pollution]);

  // Update Traffic Lights on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.keys(signalsRef.current).forEach((id) => {
      if (!trafficLights.find((t) => t.id === id)) {
        signalsRef.current[id].remove();
        delete signalsRef.current[id];
      }
    });

    trafficLights.forEach((tls) => {
      const pos = sumoToLatLng(0, 0);
      let signalMarker = signalsRef.current[tls.id];

      const isGreen = tls.active_phase === 0 || tls.active_phase === 2;
      const isYellow = tls.active_phase === 1 || tls.active_phase === 3;
      const signalColor = isGreen ? "#39D98A" : isYellow ? "#FFB84D" : "#FF4D4D";

      if (!signalMarker) {
        signalMarker = L.circleMarker(pos, {
          radius: 8,
          fillColor: signalColor,
          fillOpacity: 0.95,
          color: "#050505",
          weight: 2,
        }).addTo(map);

        signalMarker.on("click", () => {
          selectIntersection(tls.id);
        });

        signalsRef.current[tls.id] = signalMarker;
      } else {
        signalMarker.setStyle({ fillColor: signalColor });
      }
    });
  }, [trafficLights, selectIntersection]);

  // Update Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const activeIds = new Set(vehicles.map((v) => v.id));

    Object.keys(markersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    vehicles.forEach((v) => {
      const latlng = sumoToLatLng(v.x, v.y);
      let marker = markersRef.current[v.id];

      let markerColor = "#FF8A00";
      if (v.id.includes("electric")) markerColor = "#FFE7CC";
      else if (v.id.includes("truck")) markerColor = "#FFA347";

      const isSelected = selectedVehicleId === v.id;

      if (!marker) {
        marker = L.circleMarker(latlng, {
          radius: isSelected ? 8 : 5,
          fillColor: markerColor,
          fillOpacity: 0.9,
          color: isSelected ? "#FF4D4D" : "#050505",
          weight: isSelected ? 3 : 1.5,
        }).addTo(map);

        marker.on("click", () => {
          selectVehicle(v.id);
        });

        markersRef.current[v.id] = marker;
      } else {
        marker.setLatLng(latlng);
        marker.setStyle({
          radius: isSelected ? 8 : 5,
          color: isSelected ? "#FF4D4D" : "#050505",
          weight: isSelected ? 3 : 1.5,
        });
      }
    });
  }, [vehicles, selectedVehicleId, selectVehicle]);

  // Mutations
  const startMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      const startData = await startSimulation({
        scenario,
        gui: runGui,
        duration: maxSteps,
        step_length: stepLength,
        controller: initController,
      });
      setSimulationStatus(startData);

      const resumeData = await resumeSimulation();
      setSimulationStatus(resumeData);

      const statusData = await getSimulationStatus();
      setSimulationStatus(statusData);

      return statusData;
    },
    onSuccess: async () => {
      await fetchSimulationMetrics();
      webSocketService.connect();
      toast("Simulation started.", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to start simulation.", "error");
    }
  });

  const pauseMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      const data = await pauseSimulation();
      setSimulationStatus(data);
      return await getSimulationStatus();
    },
    onSuccess: (data) => {
      setSimulationStatus(data);
      toast("Simulation paused.", "info");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const resumeMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      const data = await resumeSimulation();
      setSimulationStatus(data);
      return await getSimulationStatus();
    },
    onSuccess: (data) => {
      setSimulationStatus(data);
      toast("Simulation resumed.", "success");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stepMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      const data = await stepSimulation();
      setSimulationStatus(data);
      return await getSimulationStatus();
    },
    onSuccess: (data) => {
      setSimulationStatus(data);
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stopMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      return await stopSimulation();
    },
    onSuccess: (data) => {
      setSimulationStatus(data);
      webSocketService.disconnect();
      resetState();
      toast("Simulation stopped safely.", "info");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const selectedVehicleDetail = vehicles.find((v) => v.id === selectedVehicleId);
  const filteredVehicles = vehicles.filter((v) =>
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] overflow-hidden animate-fade-in gap-6 text-[#FFF3E5]">
      
      {/* LEFT: Map, controls, and bottom timeline */}
      <div className="flex-1 flex flex-col gap-6 relative h-full">
        
        {/* Map panel */}
        <div className="flex-1 min-h-[350px] relative rounded-[24px] border border-[rgba(255,184,77,0.20)] overflow-hidden shadow-2xl bg-[#120D09]">
          <div ref={mapRef} className="w-full h-full z-0" />

          {/* Config Drawer overlay inside map */}
          {showConfig && !running && (
            <div 
              style={{ background: "rgba(25, 20, 16, 0.92)", borderColor: "rgba(255, 184, 77, 0.22)" }}
              className="absolute top-4 left-4 border shadow-2xl rounded-[18px] p-5 z-20 w-80 space-y-4 font-mono text-xs"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h4 className="font-bold text-[#FFF3E5] flex items-center gap-1.5 uppercase tracking-wider">
                  <Settings className="h-4 w-4 text-text-muted" /> Config parameters
                </h4>
                <button 
                  onClick={() => setShowConfig(false)}
                  className="text-text-muted hover:text-text-cream font-bold uppercase tracking-wider text-[9px]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 font-mono">
                <div>
                  <label className="block text-text-pale mb-1 font-bold">Scenario file</label>
                  <select 
                    value={scenario} 
                    onChange={(e) => setScenario(e.target.value)}
                    className="w-full p-2 border border-brand-orange/20 rounded-lg bg-[#120D09] text-text-cream"
                  >
                    <option value="normal">Normal City Grid</option>
                    <option value="training">Training Layout (SUMO)</option>
                    <option value="heavy">Heavy Rush-Hour Grid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-pale mb-1 font-bold">Controller mode</label>
                  <select 
                    value={initController} 
                    onChange={(e) => setInitController(e.target.value)}
                    className="w-full p-2 border border-brand-orange/20 rounded-lg bg-[#120D09] text-text-cream"
                  >
                    <option value="fixed_time">Fixed Time Cycle (Baseline)</option>
                    <option value="ppo">PPO Agent Policy</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-text-pale mb-1 font-bold">Step (s)</label>
                    <input 
                      type="number" 
                      value={stepLength}
                      step="0.1"
                      min="0.1"
                      max="2.0"
                      onChange={(e) => setStepLength(parseFloat(e.target.value))}
                      className="w-full p-2 border border-brand-orange/20 rounded-lg bg-[#120D09] text-text-cream font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-text-pale mb-1 font-bold">Max steps</label>
                    <input 
                      type="number" 
                      value={maxSteps}
                      onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                      className="w-full p-2 border border-brand-orange/20 rounded-lg bg-[#120D09] text-text-cream font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-text-pale">
                  <input 
                    type="checkbox" 
                    id="gui-check"
                    checked={runGui}
                    onChange={(e) => setRunGui(e.target.checked)}
                    className="rounded border-brand-orange/20 text-brand-orange focus:ring-brand-orange bg-[#120D09]"
                  />
                  <label htmlFor="gui-check" className="font-bold">Run SUMO GUI Window</label>
                </div>
              </div>
            </div>
          )}

          {/* Floating Map Actions Panel */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#120D09]/85 backdrop-blur border border-brand-orange/20 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-10 w-max max-w-xl">
            <div className="flex items-center gap-2.5 border-r border-white/5 pr-4">
              {!running ? (
                <>
                  <button
                    onClick={() => startMutation.mutate()}
                    disabled={startMutation.isPending}
                    className="bg-brand-orange hover:bg-brand-bright text-[#050505] rounded-full p-2.5 transition-colors disabled:opacity-50"
                    title="Start Simulation"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="text-text-pale hover:text-text-cream p-2"
                    title="Config"
                  >
                    <Sliders className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  {paused ? (
                    <button
                      onClick={() => resumeMutation.mutate()}
                      disabled={resumeMutation.isPending}
                      className="bg-brand-orange hover:bg-brand-bright text-[#050505] rounded-full p-2.5 transition-colors"
                      title="Resume"
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={() => pauseMutation.mutate()}
                      disabled={pauseMutation.isPending}
                      className="bg-brand-amber hover:bg-brand-amberGlow text-[#050505] rounded-full p-2.5 transition-colors"
                      title="Pause"
                    >
                      <Pause className="h-4 w-4 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={() => stepMutation.mutate()}
                    disabled={stepMutation.isPending}
                    className="text-text-pale hover:text-white bg-white/5 rounded-full p-2"
                    title="Step"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => stopMutation.mutate()}
                    disabled={stopMutation.isPending}
                    className="bg-eco-danger hover:bg-red-700 text-white rounded-full p-2.5 transition-colors"
                    title="Stop"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Micro Telemetry Bar */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-brand-amber font-mono tracking-wider">
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-text-muted" />
                <span>VEHICLES:</span>{" "}
                <span className="font-bold text-text-cream">{vehicles.length}</span>
              </div>
              <div className="border-l border-white/5 pl-4 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-text-muted" />
                <span>TIME:</span>{" "}
                <span className="font-bold text-text-cream">{simulationTime.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Telemetry Timeline at Bottom */}
        <GlassCard variant="chart" className="h-48 flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest text-text-muted">Live Telemetry Timeline</h4>
            <p className="text-[9px] text-text-pale">Time-series speed and vehicle quantity parameters</p>
          </div>

          <div className="h-32">
            {timelineHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineHistory}>
                  <defs>
                    <linearGradient id="colorTimelineVehicles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#FF8A00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTimelineSpeed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB84D" stopOpacity={0.10}/>
                      <stop offset="95%" stopColor="#FFB84D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="step" stroke="#A89582" tickLine={false} tick={{ fill: '#CBB9A6', fontSize: 8, fontFamily: 'monospace' }} />
                  <YAxis stroke="#A89582" tickLine={false} tick={{ fill: '#CBB9A6', fontSize: 8, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ background: "rgba(18, 14, 11, 0.95)", border: "1px solid rgba(255, 184, 77, 0.25)", borderRadius: "8px", fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="vehicles" name="Vehicles (qty)" stroke="#FF8A00" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTimelineVehicles)" />
                  <Area type="monotone" dataKey="speed" name="Avg Speed (km/h)" stroke="#FFB84D" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTimelineSpeed)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted text-xs border border-dashed border-brand-orange/15 rounded-xl font-mono">
                <span>Simulation not running. Telemetry offline.</span>
              </div>
            )}
          </div>
        </GlassCard>

      </div>

      {/* RIGHT: Selected Telemetry Details Drawer */}
      <GlassCard className="w-full lg:w-80 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-[rgba(255,183,106,0.12)]">
          <h3 className="font-bold text-[#FFF3E5] text-xs font-mono uppercase tracking-wider mb-3">Telemetry Stream</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicle ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#120D09]/45 border border-[#FFB84D]/20 rounded-lg pl-9 pr-3 py-2 text-xs text-[#FFF7ED] font-mono placeholder:text-[#A9947D] focus:ring-1 focus:ring-brand-orange"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5 font-mono text-xs">
          {selectedVehicleDetail ? (
            <div className="p-4 space-y-4 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Vehicle Details</span>
                  <h4 className="font-bold text-text-cream text-xs mt-0.5 font-mono">{selectedVehicleDetail.id}</h4>
                </div>
                <button
                  onClick={() => selectVehicle(null)}
                  className="text-text-muted hover:text-text-cream text-[9px] font-bold uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>

              {/* Stats parameters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#120D09]/45 p-2 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <div className="text-[#A9947D] text-[8px] uppercase tracking-wider">Speed</div>
                  <div className="font-bold text-[#FFF7ED] mt-0.5 font-mono">{selectedVehicleDetail.speed.toFixed(1)} km/h</div>
                </div>
                <div className="bg-[#120D09]/45 p-2 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <div className="text-[#A9947D] text-[8px] uppercase tracking-wider">Wait Time</div>
                  <div className={`font-bold mt-0.5 font-mono ${selectedVehicleDetail.waiting_time > 30 ? "text-[#FF8A00] animate-pulse" : "text-[#FFF7ED]"}`}>
                    {selectedVehicleDetail.waiting_time.toFixed(1)}s
                  </div>
                </div>
                <div className="bg-[#120D09]/45 p-2 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <div className="text-[#A9947D] text-[8px] uppercase tracking-wider">CO₂ Rate</div>
                  <div className="font-bold text-[#FFF7ED] mt-0.5 font-mono">{selectedVehicleDetail.co2.toFixed(0)} mg</div>
                </div>
                <div className="bg-[#120D09]/45 p-2 rounded-lg border border-[rgba(255,184,77,0.16)]">
                  <div className="text-[#A9947D] text-[8px] uppercase tracking-wider">NOx Rate</div>
                  <div className="font-bold text-[#FFF7ED] mt-0.5 font-mono">{selectedVehicleDetail.nox.toFixed(1)} mg</div>
                </div>
                <div className="bg-[#120D09]/45 p-2 rounded-lg border border-[rgba(255,184,77,0.16)] col-span-2">
                  <div className="text-[#A9947D] text-[8px] uppercase tracking-wider">Fuel Burn</div>
                  <div className="font-bold text-[#FFF7ED] mt-0.5 font-mono">{selectedVehicleDetail.fuel_consumption.toFixed(1)} ml</div>
                </div>
              </div>

              {/* Lane Info */}
              <div className="text-[10px] space-y-1.5 border-t border-white/5 pt-3 font-mono">
                <div>
                  <span className="text-text-muted">Lane ID:</span>{" "}
                  <span className="font-bold text-brand-amber">{selectedVehicleDetail.lane_id}</span>
                </div>
                <div>
                  <span className="text-text-muted">Road Link:</span>{" "}
                  <span className="font-bold text-brand-amber">{selectedVehicleDetail.road_id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 py-8 text-center text-text-muted space-y-2">
              <Info className="h-6 w-6 mx-auto text-text-dim/40" />
              <p className="font-sans leading-relaxed text-[11px]">Select any vehicle marker on the digital twin map to view real-time emission and speed telemetry details.</p>
            </div>
          )}

          {/* List of active vehicles */}
          <div className="p-4 space-y-2 border-t border-white/5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block mb-2 font-mono">
              Active Vehicles ({filteredVehicles.length})
            </span>
            
            {filteredVehicles.length > 0 ? (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVehicle(v.id)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border font-mono ${
                      selectedVehicleId === v.id
                        ? "bg-[#FF8A00]/10 border-[#FF8A00] text-white font-bold"
                        : "bg-[#120D09]/45 border-[rgba(255,184,77,0.16)] text-[#FFF7ED] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{v.id}</span>
                      <span className="text-[10px] text-brand-amber font-mono">{v.speed.toFixed(0)} km/h</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted border border-dashed border-[rgba(255,183,106,0.12)] rounded-lg font-mono">
                No active traffic flows.
              </div>
            )}
          </div>
        </div>
      </GlassCard>
      
    </div>
  );
}
