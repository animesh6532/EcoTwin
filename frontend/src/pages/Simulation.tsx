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
  Settings
} from "lucide-react";
import { toast } from "../utils/toast";
import { SimulationStatus } from "../types";

const CENTER_LAT = 52.5200;
const CENTER_LNG = 13.4050;

function sumoToLatLng(x: number, y: number): [number, number] {
  // 1 degree of latitude is ~111,320m
  const lat = CENTER_LAT + (y / 111320);
  // longitude depends on latitude
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
    sessionId,
    pollution,
    selectedVehicleId,
    selectVehicle,
    selectIntersection,
    setSimulationStatus,
    resetState,
  } = useSimulationStore();

  // Settings state for start configuration
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

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      maxZoom: 18,
      minZoom: 14,
    }).setView([CENTER_LAT, CENTER_LNG], 16);

    // Light neutral basemap tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Draw main roads reference lines
    const lineOptions = { color: "#CBD5E1", weight: 8, opacity: 0.7 };
    
    // N-S road
    L.polyline([sumoToLatLng(0, -500), sumoToLatLng(0, 500)], lineOptions).addTo(map);
    // E-W road
    L.polyline([sumoToLatLng(-500, 0), sumoToLatLng(500, 0)], lineOptions).addTo(map);

    // Draw center junction boundary marker
    const centerBounds: [[number, number], [number, number]] = [
      sumoToLatLng(-25, -25),
      sumoToLatLng(25, 25)
    ];
    L.rectangle(centerBounds, {
      color: "#1E293B",
      weight: 1.5,
      fillColor: "#F1F5F9",
      fillOpacity: 0.6,
    }).addTo(map).on("click", () => {
      selectIntersection("center");
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [selectIntersection]);

  // Update Pollution Grid
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old cells
    gridCellsRef.current.forEach((cell) => cell.remove());
    gridCellsRef.current = [];

    // Draw pollution cells
    pollution.forEach((cell) => {
      // Scale coordinates (assume 50x50m cells)
      const halfSize = 25;
      const bounds: [[number, number], [number, number]] = [
        sumoToLatLng(cell.x - halfSize, cell.y - halfSize),
        sumoToLatLng(cell.x + halfSize, cell.y + halfSize)
      ];

      // scientifically styled pollution color scale: clean (cyan) -> red
      let fillColor = "#06B6D4"; // clean cyan
      if (cell.intensity > 0.8) fillColor = "#DC2626"; // red
      else if (cell.intensity > 0.6) fillColor = "#EA580C"; // orange
      else if (cell.intensity > 0.3) fillColor = "#EAB308"; // yellow

      const rect = L.rectangle(bounds, {
        stroke: false,
        fillColor: fillColor,
        fillOpacity: cell.intensity * 0.3,
      }).addTo(map);

      rect.on("click", () => {
        toast(`Pollution hotspot: Intensity ${(cell.intensity * 100).toFixed(0)}%, CO₂: ${cell.co2.toFixed(1)}mg`, "info");
      });

      gridCellsRef.current.push(rect);
    });
  }, [pollution]);

  // Update Signals on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old signals if not present
    Object.keys(signalsRef.current).forEach((id) => {
      if (!trafficLights.find((t) => t.id === id)) {
        signalsRef.current[id].remove();
        delete signalsRef.current[id];
      }
    });

    // Render traffic lights around junction center
    trafficLights.forEach((tls) => {
      // Place signals slightly offset from center
      const pos = sumoToLatLng(0, 0); // center
      let signalMarker = signalsRef.current[tls.id];

      // Check current phase index to determine color
      const isGreen = tls.active_phase === 0 || tls.active_phase === 2;
      const isYellow = tls.active_phase === 1 || tls.active_phase === 3;
      const signalColor = isGreen ? "#16A34A" : isYellow ? "#EAB308" : "#DC2626";

      if (!signalMarker) {
        signalMarker = L.circleMarker(pos, {
          radius: 8,
          fillColor: signalColor,
          fillOpacity: 0.9,
          color: "#FFFFFF",
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

  // High Performance Vehicle Marker Updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const activeIds = new Set(vehicles.map((v) => v.id));

    // Remove inactive vehicles
    Object.keys(markersRef.current).forEach((id) => {
      if (!activeIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add / Update active vehicles
    vehicles.forEach((v) => {
      const latlng = sumoToLatLng(v.x, v.y);
      let marker = markersRef.current[v.id];

      // Color coding vehicle type
      let markerColor = "#06B6D4"; // Gasoline passenger (Cyan)
      if (v.id.includes("electric")) markerColor = "#16A34A"; // EV (Green)
      else if (v.id.includes("truck")) markerColor = "#334155"; // Truck (slate)

      const isSelected = selectedVehicleId === v.id;

      if (!marker) {
        marker = L.circleMarker(latlng, {
          radius: isSelected ? 8 : 5,
          fillColor: markerColor,
          fillOpacity: 0.85,
          color: isSelected ? "#DC2626" : "#FFFFFF",
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
          color: isSelected ? "#DC2626" : "#FFFFFF",
          weight: isSelected ? 3 : 1.5,
        });
      }
    });
  }, [vehicles, selectedVehicleId, selectVehicle]);

  // MUTATIONS FOR CONTROLS
  const startMutation = useMutation<SimulationStatus, Error>({
    mutationFn: () => startSimulation({
      scenario,
      gui: runGui,
      duration: maxSteps,
      step_length: stepLength,
      controller: initController,
    }),
    onSuccess: (data) => {
      setSimulationStatus(data);
      webSocketService.connect();
      toast("Simulation started successfully.", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to start simulation.", "error");
    }
  });

  const pauseMutation = useMutation<SimulationStatus, Error>({
    mutationFn: pauseSimulation,
    onSuccess: (data) => {
      setSimulationStatus(data);
      toast("Simulation paused.", "info");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const resumeMutation = useMutation<SimulationStatus, Error>({
    mutationFn: resumeSimulation,
    onSuccess: (data) => {
      setSimulationStatus(data);
      toast("Simulation resumed.", "success");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stepMutation = useMutation<SimulationStatus, Error>({
    mutationFn: stepSimulation,
    onSuccess: (data) => {
      setSimulationStatus(data);
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stopMutation = useMutation<SimulationStatus, Error>({
    mutationFn: stopSimulation,
    onSuccess: (data) => {
      setSimulationStatus(data);
      webSocketService.disconnect();
      resetState();
      toast("Simulation stopped and cleaned up safely.", "info");
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  // Selected Vehicle Info
  const selectedVehicleDetail = vehicles.find((v) => v.id === selectedVehicleId);

  // Search & highlight
  const filteredVehicles = vehicles.filter((v) =>
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden animate-fade-in">
      {/* LEFT: Map & Controls (flex-1) */}
      <div className="flex-1 flex flex-col relative h-full bg-bg-secondary">
        {/* Map Container */}
        <div ref={mapRef} className="w-full flex-1 z-0" />

        {/* Configuration Overlay (slide-in) */}
        {showConfig && !running && (
          <div className="absolute top-4 left-4 bg-white border border-border shadow-lg rounded-xl p-5 z-20 w-80 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h4 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-text-muted" /> Simulation Config
              </h4>
              <button 
                onClick={() => setShowConfig(false)}
                className="text-text-muted hover:text-text-primary text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-text-secondary mb-1">Scenario File</label>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-bg-secondary"
                >
                  <option value="normal">Normal City Grid</option>
                  <option value="training">Training Layout (SUMO)</option>
                  <option value="heavy">Heavy Rush-Hour Grid</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-text-secondary mb-1">Default Controller</label>
                <select 
                  value={initController} 
                  onChange={(e) => setInitController(e.target.value)}
                  className="w-full p-2 border border-border rounded bg-bg-secondary"
                >
                  <option value="fixed_time">Fixed Time Cycle (Baseline)</option>
                  <option value="ppo">PPO Agent Policy</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium text-text-secondary mb-1">Step Length (s)</label>
                  <input 
                    type="number" 
                    value={stepLength}
                    step="0.1"
                    min="0.1"
                    max="2.0"
                    onChange={(e) => setStepLength(parseFloat(e.target.value))}
                    className="w-full p-1.5 border border-border rounded bg-bg-secondary font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium text-text-secondary mb-1">Max Steps</label>
                  <input 
                    type="number" 
                    value={maxSteps}
                    onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-border rounded bg-bg-secondary font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="gui-check"
                  checked={runGui}
                  onChange={(e) => setRunGui(e.target.checked)}
                  className="rounded border-border text-eco-green focus:ring-eco-green"
                />
                <label htmlFor="gui-check" className="font-medium text-text-secondary">Run SUMO GUI Window</label>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-border shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-10 w-max max-w-xl">
          <div className="flex items-center gap-2 border-r border-border pr-4">
            {!running ? (
              <>
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="bg-eco-green hover:bg-eco-forest text-white rounded-full p-2.5 transition-colors disabled:opacity-50"
                  title="Start Simulation"
                >
                  <Play className="h-4 w-4 fill-white" />
                </button>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-text-secondary hover:text-text-primary p-2"
                  title="Configure"
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
                    className="bg-eco-green hover:bg-eco-forest text-white rounded-full p-2.5 transition-colors"
                    title="Resume"
                  >
                    <Play className="h-4 w-4 fill-white" />
                  </button>
                ) : (
                  <button
                    onClick={() => pauseMutation.mutate()}
                    disabled={pauseMutation.isPending}
                    className="bg-traffic-yellow hover:bg-yellow-600 text-white rounded-full p-2.5 transition-colors"
                    title="Pause"
                  >
                    <Pause className="h-4 w-4 fill-white" />
                  </button>
                )}

                <button
                  onClick={() => stepMutation.mutate()}
                  disabled={stepMutation.isPending}
                  className="text-text-secondary hover:text-text-primary bg-bg-secondary rounded-full p-2"
                  title="Step Simulation"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                  className="bg-carbon-critical hover:bg-red-700 text-white rounded-full p-2.5 transition-colors"
                  title="Stop"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Quick Metrics in Control bar */}
          <div className="flex items-center gap-4 text-xs font-medium text-text-secondary font-mono">
            <div>
              <span>Vehicles:</span>{" "}
              <span className="font-bold text-text-primary">{vehicles.length}</span>
            </div>
            <div className="border-l border-border pl-4">
              <span>Time:</span>{" "}
              <span className="font-bold text-text-primary">{simulationTime.toFixed(1)}s</span>
            </div>
            {sessionId && (
              <div className="border-l border-border pl-4 text-[10px] text-text-muted">
                Session: {sessionId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Vehicles Inspector Drawer (w-80 / 320px) */}
      <div className="w-80 bg-white border-l border-border flex flex-col h-full z-10">
        {/* Search Header */}
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-text-primary text-sm mb-3">Network Vehicles</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicle ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
          </div>
        </div>

        {/* Selected Vehicle details (Inspector) */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {selectedVehicleDetail ? (
            <div className="p-4 space-y-4 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Inspector</span>
                  <h4 className="font-bold text-text-primary text-sm mt-0.5">Vehicle: {selectedVehicleDetail.id}</h4>
                </div>
                <button
                  onClick={() => selectVehicle(null)}
                  className="text-text-muted hover:text-text-primary text-xs"
                >
                  Deselect
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-bg-secondary p-2.5 rounded border border-border">
                  <div className="text-text-muted text-[10px]">Speed</div>
                  <div className="font-bold text-text-primary mt-1">{selectedVehicleDetail.speed.toFixed(1)} km/h</div>
                </div>
                <div className="bg-bg-secondary p-2.5 rounded border border-border">
                  <div className="text-text-muted text-[10px]">Wait Time</div>
                  <div className={`font-bold mt-1 ${selectedVehicleDetail.waiting_time > 30 ? "text-carbon-alert" : "text-text-primary"}`}>
                    {selectedVehicleDetail.waiting_time.toFixed(1)}s
                  </div>
                </div>
                <div className="bg-bg-secondary p-2.5 rounded border border-border">
                  <div className="text-text-muted text-[10px]">CO₂ Emission</div>
                  <div className="font-bold text-text-primary mt-1">{selectedVehicleDetail.co2.toFixed(1)} mg</div>
                </div>
                <div className="bg-bg-secondary p-2.5 rounded border border-border">
                  <div className="text-text-muted text-[10px]">NOx Emission</div>
                  <div className="font-bold text-text-primary mt-1">{selectedVehicleDetail.nox.toFixed(2)} mg</div>
                </div>
                <div className="bg-bg-secondary p-2.5 rounded border border-border col-span-2">
                  <div className="text-text-muted text-[10px]">Fuel Consumption</div>
                  <div className="font-bold text-text-primary mt-1">{selectedVehicleDetail.fuel_consumption.toFixed(2)} ml</div>
                </div>
              </div>

              {/* Lane Info */}
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="text-text-muted">Lane:</span>{" "}
                  <span className="font-mono text-text-secondary">{selectedVehicleDetail.lane_id}</span>
                </div>
                <div>
                  <span className="text-text-muted">Road:</span>{" "}
                  <span className="font-mono text-text-secondary">{selectedVehicleDetail.road_id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 py-8 text-center text-xs text-text-muted space-y-2">
              <Info className="h-6 w-6 mx-auto text-text-muted/40" />
              <p>Click any vehicle marker on the map to inspect its real-time telemetry details.</p>
            </div>
          )}

          {/* List of active filtered vehicles */}
          <div className="p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">
              Active List ({filteredVehicles.length})
            </span>
            
            {filteredVehicles.length > 0 ? (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVehicle(v.id)}
                    className={`w-full text-left p-2 rounded text-xs transition-colors border ${
                      selectedVehicleId === v.id
                        ? "bg-eco-green/10 border-eco-green text-eco-forest font-semibold"
                        : "bg-bg-secondary border-border text-text-primary hover:bg-border/30"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{v.id}</span>
                      <span className="font-mono text-[10px] text-text-muted">{v.speed.toFixed(0)} km/h</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                No active vehicles match the search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
