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
    fetchSimulationMetrics,
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

    // Dark Matter basemap tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Draw main roads reference lines in warm dark brown
    const lineOptions = { color: "#4A2810", weight: 8, opacity: 0.6 };
    
    // N-S road
    L.polyline([sumoToLatLng(0, -500), sumoToLatLng(0, 500)], lineOptions).addTo(map);
    // E-W road
    L.polyline([sumoToLatLng(-500, 0), sumoToLatLng(500, 0)], lineOptions).addTo(map);

    // Draw center junction boundary marker in bright brand orange
    const centerBounds: [[number, number], [number, number]] = [
      sumoToLatLng(-25, -25),
      sumoToLatLng(25, 25)
    ];
    L.rectangle(centerBounds, {
      color: "#FF8A00",
      weight: 1.5,
      fillColor: "#FF8A00",
      fillOpacity: 0.08,
    }).addTo(map).on("click", () => {
      selectIntersection("center");
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [selectIntersection]);

  // Update Pollution Grid using correct warm severity scales
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old cells
    gridCellsRef.current.forEach((cell) => cell.remove());
    gridCellsRef.current = [];

    // Draw pollution cells
    pollution.forEach((cell) => {
      const halfSize = 25;
      const bounds: [[number, number], [number, number]] = [
        sumoToLatLng(cell.x - halfSize, cell.y - halfSize),
        sumoToLatLng(cell.x + halfSize, cell.y + halfSize)
      ];

      // LOW: Peach -> MODERATE: Amber -> HIGH: Orange -> CRITICAL: Burnt / Red
      let fillColor = "#FFD2A3"; // low = Light Peach
      if (cell.intensity > 0.8) fillColor = "#FF4D4D"; // critical red
      else if (cell.intensity > 0.6) fillColor = "#E06C00"; // high = Burnt Orange
      else if (cell.intensity > 0.3) fillColor = "#FFB84D"; // moderate = Amber

      const rect = L.rectangle(bounds, {
        stroke: false,
        fillColor: fillColor,
        fillOpacity: cell.intensity * 0.3,
      }).addTo(map);

      rect.on("click", () => {
        toast(`Carbon hotspot: Intensity ${(cell.intensity * 100).toFixed(0)}%, CO₂: ${cell.co2.toFixed(1)}mg`, "info");
      });

      gridCellsRef.current.push(rect);
    });
  }, [pollution]);

  // Update Signals on Map (keeping actual traffic lights semantic colors)
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
      const pos = sumoToLatLng(0, 0); // center
      let signalMarker = signalsRef.current[tls.id];

      // Green pattern, Yellow transition, or Red
      const isGreen = tls.active_phase === 0 || tls.active_phase === 2;
      const isYellow = tls.active_phase === 1 || tls.active_phase === 3;
      const signalColor = isGreen ? "#39D98A" : isYellow ? "#FFB84D" : "#FF4D4D";

      if (!signalMarker) {
        signalMarker = L.circleMarker(pos, {
          radius: 8,
          fillColor: signalColor,
          fillOpacity: 0.95,
          color: "#090909",
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

  // High Performance Vehicle Marker Updates (Warm Orange/Peach/Burnt palette)
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

      // Warm color coding vehicle type
      let markerColor = "#FF8A00"; // Gasoline passenger (Primary Orange)
      if (v.id.includes("electric")) markerColor = "#FFE7CC"; // EV (Pale Peach)
      else if (v.id.includes("truck")) markerColor = "#E06C00"; // Truck (Burnt Orange)

      const isSelected = selectedVehicleId === v.id;

      if (!marker) {
        marker = L.circleMarker(latlng, {
          radius: isSelected ? 8 : 5,
          fillColor: markerColor,
          fillOpacity: 0.9,
          color: isSelected ? "#FF4D4D" : "#090909",
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
          color: isSelected ? "#FF4D4D" : "#090909",
          weight: isSelected ? 3 : 1.5,
        });
      }
    });
  }, [vehicles, selectedVehicleId, selectVehicle]);

  // MUTATIONS FOR CONTROLS
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
      toast("Simulation started and running.", "success");
    },
    onError: (err: any) => {
      toast(err.message || "Failed to start simulation flow.", "error");
    }
  });

  const pauseMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      const data = await pauseSimulation();
      setSimulationStatus(data);
      const status = await getSimulationStatus();
      setSimulationStatus(status);
      return status;
    },
    onSuccess: async () => {
      await fetchSimulationMetrics();
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
      const status = await getSimulationStatus();
      setSimulationStatus(status);
      return status;
    },
    onSuccess: async () => {
      await fetchSimulationMetrics();
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
      const status = await getSimulationStatus();
      setSimulationStatus(status);
      return status;
    },
    onSuccess: async () => {
      await fetchSimulationMetrics();
    },
    onError: (err: any) => {
      toast(err.message, "error");
    }
  });

  const stopMutation = useMutation<SimulationStatus, Error>({
    mutationFn: async () => {
      const data = await stopSimulation();
      setSimulationStatus(data);
      return data;
    },
    onSuccess: () => {
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
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden animate-fade-in gap-8 text-[#FFF3E5]">
      {/* LEFT: Map & Controls */}
      <div className="flex-1 flex flex-col relative h-full glass-panel border border-[#75451A]/20 overflow-hidden shadow-2xl">
        {/* Map Container */}
        <div ref={mapRef} className="w-full flex-1 z-0" />

        {/* Configuration Overlay (slide-in) */}
        {showConfig && !running && (
          <div className="absolute top-4 left-4 bg-[#0d0d0d]/90 backdrop-blur border border-[#75451A]/30 shadow-2xl rounded-xl p-5 z-20 w-80 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="font-bold text-xs text-[#FFF3E5] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Settings className="h-4 w-4 text-[#9A8575]" /> Simulation Config
              </h4>
              <button 
                onClick={() => setShowConfig(false)}
                className="text-[#9A8575] hover:text-[#FFF3E5] text-[10px] font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block font-medium text-[#FFD2A3] mb-1">Scenario File</label>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full p-2 border border-[#75451A]/30 rounded bg-[#11100E] text-text-primary"
                >
                  <option value="normal">Normal City Grid</option>
                  <option value="training">Training Layout (SUMO)</option>
                  <option value="heavy">Heavy Rush-Hour Grid</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#FFD2A3] mb-1">Default Controller</label>
                <select 
                  value={initController} 
                  onChange={(e) => setInitController(e.target.value)}
                  className="w-full p-2 border border-[#75451A]/30 rounded bg-[#11100E] text-text-primary"
                >
                  <option value="fixed_time">Fixed Time Cycle (Baseline)</option>
                  <option value="ppo">PPO Agent Policy</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium text-[#FFD2A3] mb-1">Step Length (s)</label>
                  <input 
                    type="number" 
                    value={stepLength}
                    step="0.1"
                    min="0.1"
                    max="2.0"
                    onChange={(e) => setStepLength(parseFloat(e.target.value))}
                    className="w-full p-1.5 border border-[#75451A]/30 rounded bg-[#11100E] text-text-primary font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium text-[#FFD2A3] mb-1">Max Steps</label>
                  <input 
                    type="number" 
                    value={maxSteps}
                    onChange={(e) => setMaxSteps(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-[#75451A]/30 rounded bg-[#11100E] text-text-primary font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[#FFD2A3]">
                <input 
                  type="checkbox" 
                  id="gui-check"
                  checked={runGui}
                  onChange={(e) => setRunGui(e.target.checked)}
                  className="rounded border-[#75451A]/30 text-[#FF8A00] focus:ring-[#FF8A00] bg-[#11100E]"
                />
                <label htmlFor="gui-check" className="font-medium">Run SUMO GUI Window</label>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur border border-[#75451A]/35 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-10 w-max max-w-xl">
          <div className="flex items-center gap-2 border-r border-[#75451A]/20 pr-4">
            {!running ? (
              <>
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="bg-[#FF8A00] hover:bg-[#FFA347] text-black rounded-full p-2.5 transition-colors disabled:opacity-50"
                  title="Start Simulation"
                >
                  <Play className="h-4 w-4 fill-black" />
                </button>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="text-[#FFD2A3] hover:text-[#FFF3E5] p-2"
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
                    className="bg-[#FF8A00] hover:bg-[#FFA347] text-black rounded-full p-2.5 transition-colors"
                    title="Resume"
                  >
                    <Play className="h-4 w-4 fill-black" />
                  </button>
                ) : (
                  <button
                    onClick={() => pauseMutation.mutate()}
                    disabled={pauseMutation.isPending}
                    className="bg-[#FFB84D] hover:bg-[#FFA347] text-black rounded-full p-2.5 transition-colors"
                    title="Pause"
                  >
                    <Pause className="h-4 w-4 fill-black" />
                  </button>
                )}

                <button
                  onClick={() => stepMutation.mutate()}
                  disabled={stepMutation.isPending}
                  className="text-[#FFD2A3] hover:text-white bg-white/5 rounded-full p-2"
                  title="Step Simulation"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                  className="bg-[#FF4D4D] hover:bg-red-700 text-white rounded-full p-2.5 transition-colors"
                  title="Stop"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Quick Metrics in Control bar */}
          <div className="flex items-center gap-4 text-[10px] font-bold text-[#FFD2A3] font-mono tracking-wider">
            <div>
              <span>VEHICLES:</span>{" "}
              <span className="font-bold text-[#FFF3E5]">{vehicles.length}</span>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span>TIME:</span>{" "}
              <span className="font-bold text-[#FFF3E5]">{simulationTime.toFixed(1)}s</span>
            </div>
            {sessionId && (
              <div className="border-l border-white/5 pl-4 text-[9px] text-[#9A8575]">
                SESSION: {sessionId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Vehicles Inspector Drawer */}
      <div className="w-80 glass-panel border border-[#75451A]/20 flex flex-col h-full z-10 shadow-2xl">
        <div className="p-4 border-b border-[#75451A]/10">
          <h3 className="font-bold text-[#FFF3E5] text-xs font-mono uppercase tracking-wider mb-3">Network Vehicles</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search vehicle ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#11100E] border border-[#75451A]/30 rounded-lg pl-9 pr-3 py-2 text-xs text-[#FFF3E5] font-mono placeholder:text-[#9A8575] focus:ring-1 focus:ring-[#FF8A00]"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9A8575]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {selectedVehicleDetail ? (
            <div className="p-4 space-y-4 animate-fade-in font-mono text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A8575]">Active Inspector</span>
                  <h4 className="font-bold text-[#FFF3E5] text-xs mt-0.5">{selectedVehicleDetail.id}</h4>
                </div>
                <button
                  onClick={() => selectVehicle(null)}
                  className="text-[#9A8575] hover:text-[#FFF3E5] text-[10px] font-bold uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#11100E] p-2.5 rounded border border-[#75451A]/10">
                  <div className="text-[#9A8575] text-[9px] uppercase tracking-wider">Speed</div>
                  <div className="font-bold text-[#FFF3E5] mt-1">{selectedVehicleDetail.speed.toFixed(1)} km/h</div>
                </div>
                <div className="bg-[#11100E] p-2.5 rounded border border-[#75451A]/10">
                  <div className="text-[#9A8575] text-[9px] uppercase tracking-wider">Wait Time</div>
                  <div className={`font-bold mt-1 ${selectedVehicleDetail.waiting_time > 30 ? "text-[#FF8A00] animate-pulse" : "text-[#FFF3E5]"}`}>
                    {selectedVehicleDetail.waiting_time.toFixed(1)}s
                  </div>
                </div>
                <div className="bg-[#11100E] p-2.5 rounded border border-[#75451A]/10">
                  <div className="text-[#9A8575] text-[9px] uppercase tracking-wider">CO₂</div>
                  <div className="font-bold text-[#FFF3E5] mt-1">{selectedVehicleDetail.co2.toFixed(1)} mg</div>
                </div>
                <div className="bg-[#11100E] p-2.5 rounded border border-[#75451A]/10">
                  <div className="text-[#9A8575] text-[9px] uppercase tracking-wider">NOx</div>
                  <div className="font-bold text-[#FFF3E5] mt-1">{selectedVehicleDetail.nox.toFixed(2)} mg</div>
                </div>
                <div className="bg-[#11100E] p-2.5 rounded border border-[#75451A]/10 col-span-2">
                  <div className="text-[#9A8575] text-[9px] uppercase tracking-wider">Fuel</div>
                  <div className="font-bold text-[#FFF3E5] mt-1">{selectedVehicleDetail.fuel_consumption.toFixed(2)} ml</div>
                </div>
              </div>

              {/* Lane Info */}
              <div className="text-[10px] space-y-1.5 border-t border-white/5 pt-3">
                <div>
                  <span className="text-[#9A8575]">Lane:</span>{" "}
                  <span className="font-semibold text-[#FFD2A3]">{selectedVehicleDetail.lane_id}</span>
                </div>
                <div>
                  <span className="text-[#9A8575]">Road:</span>{" "}
                  <span className="font-semibold text-[#FFD2A3]">{selectedVehicleDetail.road_id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 py-8 text-center text-xs text-[#9A8575] space-y-2">
              <Info className="h-6 w-6 mx-auto text-[#9A8575]/40" />
              <p>Click any vehicle marker on the digital twin map to inspect real-time telemetry details.</p>
            </div>
          )}

          {/* List of active filtered vehicles */}
          <div className="p-4 space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A8575] block mb-2 font-mono">
              Telemetry Stream ({filteredVehicles.length})
            </span>
            
            {filteredVehicles.length > 0 ? (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => selectVehicle(v.id)}
                    className={`w-full text-left p-2 rounded text-xs transition-colors border font-mono ${
                      selectedVehicleId === v.id
                        ? "bg-[#FF8A00]/10 border-[#FF8A00] text-white font-semibold"
                        : "bg-[#11100E] border-[#75451A]/10 text-[#FFF3E5] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{v.id}</span>
                      <span className="font-mono text-[9px] text-[#9A8575]">{v.speed.toFixed(0)} km/h</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#9A8575] border border-dashed border-[#75451A]/20 rounded-lg">
                No active vehicles stream.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
