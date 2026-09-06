import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Layers, AlertTriangle, MapPin, Navigation, Car } from "lucide-react";
import { TrafficLight, Vehicle } from "../../types";

const CENTER_LAT = 52.5200;
const CENTER_LNG = 13.4050;

function sumoToLatLng(x: number, y: number): [number, number] {
  // Convert 1000x1000m SUMO cartesian grid (centered at 500, 500) to LatLng
  const offsetX = x - 500;
  const offsetY = y - 500;
  const lat = CENTER_LAT + offsetY / 111320;
  const lng = CENTER_LNG + offsetX / (111320 * Math.cos((CENTER_LAT * Math.PI) / 180));
  return [lat, lng];
}

interface TrafficMapProps {
  userLat: number | null;
  userLng: number | null;
  userAccuracy: number | null;
  junctions: TrafficLight[];
  selectedJunctionId: string | null;
  onSelectJunction: (id: string) => void;
  vehicles: Vehicle[];
  isRunning: boolean;
}

export const TrafficMap: React.FC<TrafficMapProps> = ({
  userLat,
  userLng,
  userAccuracy,
  junctions,
  selectedJunctionId,
  onSelectJunction,
  vehicles,
  isRunning,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const junctionMarkersRef = useRef<{ [id: string]: L.Marker }>({});
  const vehicleMarkersRef = useRef<{ [id: string]: L.Marker }>({});
  const [tileError, setTileError] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      maxZoom: 18,
      minZoom: 13,
    }).setView([CENTER_LAT, CENTER_LNG], 16);

    const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });

    tiles.on("tileerror", () => setTileError(true));
    tiles.addTo(map);

    // Render SUMO road layout polylines (N-S and E-W crossroad corridor)
    const lineOptions = { color: "#FF8A00", weight: 6, opacity: 0.35 };
    L.polyline([sumoToLatLng(500, 0), sumoToLatLng(500, 1000)], lineOptions).addTo(map);
    L.polyline([sumoToLatLng(0, 500), sumoToLatLng(1000, 500)], lineOptions).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User GPS Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLat === null || userLng === null) {
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

    if (userAccuracy) {
      userCircleRef.current = L.circle([userLat, userLng], {
        radius: userAccuracy,
        color: "#3B82F6",
        weight: 1,
        fillColor: "#3B82F6",
        fillOpacity: 0.1,
      }).addTo(map);
    }

    userMarkerRef.current = L.marker([userLat, userLng], {
      icon: L.divIcon({
        className: "custom-user-gps-marker",
        html: `<div class="relative flex items-center justify-center">
                 <span class="absolute inline-flex h-7 w-7 rounded-full bg-blue-500/40 animate-ping"></span>
                 <span class="relative flex h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow-lg"></span>
               </div>`,
        iconSize: [28, 28],
      }),
    })
      .addTo(map)
      .bindPopup(
        `<div class="font-mono text-[10px] text-blue-400 bg-[#090604] p-2 border border-blue-500/30 rounded-md">📍 YOUR GPS LOCATION<br/>Lat: ${userLat.toFixed(
          4
        )}, Lng: ${userLng.toFixed(4)}</div>`
      );
  }, [userLat, userLng, userAccuracy]);

  // Update SUMO Junction Signal Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Default center junction if no junctions returned yet
    const jList = junctions.length > 0 ? junctions : [{ id: "center" } as any];

    jList.forEach((j) => {
      const isSelected = selectedJunctionId === j.id;
      const [jLat, jLng] = sumoToLatLng(500, 500); // center junction coordinates

      const northState = j.signal_state?.north || "GREEN";
      let ringColor = "border-emerald-500 bg-emerald-500/20 text-emerald-400";
      if (northState === "YELLOW") ringColor = "border-amber-500 bg-amber-500/20 text-amber-400";
      if (northState === "RED") ringColor = "border-rose-500 bg-rose-500/20 text-rose-400";

      if (junctionMarkersRef.current[j.id]) {
        junctionMarkersRef.current[j.id].remove();
      }

      const marker = L.marker([jLat, jLng], {
        icon: L.divIcon({
          className: "custom-junction-marker",
          html: `<div class="relative flex items-center justify-center cursor-pointer">
                   ${
                     isSelected
                       ? '<span class="absolute inline-flex h-10 w-10 rounded-full bg-brand-orange/40 animate-ping"></span>'
                       : ""
                   }
                   <div class="relative flex items-center justify-center h-8 w-8 rounded-full border-2 ${ringColor} bg-[#090604] shadow-xl">
                     <span class="text-[9px] font-mono font-bold text-white">${j.id.toUpperCase()}</span>
                   </div>
                 </div>`,
          iconSize: [40, 40],
        }),
      }).addTo(map);

      marker.on("click", () => onSelectJunction(j.id));
      marker.bindPopup(
        `<div class="font-mono text-xs text-brand-orange bg-[#090604] p-2 border border-brand-orange/30 rounded-md">
          <strong>JUNCTION: ${j.id}</strong><br/>
          Phase: ${j.active_phase_name || `Phase ${j.active_phase ?? 0}`}<br/>
          Vehicles: ${j.total_vehicles ?? 0} | Queue: ${j.total_queue ?? 0}
        </div>`
      );

      junctionMarkersRef.current[j.id] = marker;
    });
  }, [junctions, selectedJunctionId, onSelectJunction]);

  // Update Live Vehicle Position Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isRunning) {
      // Clear vehicle markers when simulation is offline
      Object.values(vehicleMarkersRef.current).forEach((m) => m.remove());
      vehicleMarkersRef.current = {};
      return;
    }

    const currentVIds = new Set(vehicles.map((v) => v.id));

    // Remove old vehicle markers no longer present in SUMO
    Object.keys(vehicleMarkersRef.current).forEach((vId) => {
      if (!currentVIds.has(vId)) {
        vehicleMarkersRef.current[vId].remove();
        delete vehicleMarkersRef.current[vId];
      }
    });

    // Render/update current SUMO vehicles
    vehicles.forEach((v) => {
      const [vLat, vLng] = sumoToLatLng(v.x, v.y);
      const isStopped = v.speed < 0.5;

      if (vehicleMarkersRef.current[v.id]) {
        // Update existing vehicle marker position
        vehicleMarkersRef.current[v.id].setLatLng([vLat, vLng]);
      } else {
        // Create new vehicle marker
        const vMarker = L.marker([vLat, vLng], {
          icon: L.divIcon({
            className: "custom-vehicle-marker",
            html: `<div class="relative flex items-center justify-center">
                     <span class="h-2.5 w-2.5 rounded-full ${
                       isStopped ? "bg-rose-500 ring-2 ring-rose-500/50" : "bg-emerald-400 ring-2 ring-emerald-400/50"
                     }"></span>
                   </div>`,
            iconSize: [12, 12],
          }),
        }).addTo(map);

        vMarker.bindPopup(
          `<div class="font-mono text-[10px] text-text-cream bg-[#090604] p-2 border border-white/10 rounded-md">
            Vehicle ID: ${v.id}<br/>
            Speed: ${v.speed.toFixed(1)} km/h<br/>
            Waiting: ${v.waiting_time.toFixed(1)}s
          </div>`
        );

        vehicleMarkersRef.current[v.id] = vMarker;
      }
    });
  }, [vehicles, isRunning]);

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-[rgba(255,184,77,0.2)] shadow-2xl bg-[#090604]">
      {/* Leaflet DOM container */}
      <div ref={mapRef} className="absolute inset-0 z-0 bg-[#090604]" />

      {/* Map scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-30" />

      {/* Top Map Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090604]/85 border border-[rgba(255,184,77,0.2)] rounded-xl font-mono text-[10px] text-brand-orange uppercase tracking-widest pointer-events-auto backdrop-blur-sm">
          <Layers className="h-3.5 w-3.5" />
          <span>SUMO NETWORK INTERACTIVE MAP</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {userLat !== null && userLng !== null && (
            <button
              onClick={() => mapInstanceRef.current?.flyTo([userLat, userLng], 16)}
              className="px-3 py-1.5 bg-[#090604]/85 border border-blue-500/30 hover:border-blue-400 text-blue-400 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" /> LOCATE ME
            </button>
          )}

          <button
            onClick={() => mapInstanceRef.current?.flyTo([CENTER_LAT, CENTER_LNG], 16)}
            className="px-3 py-1.5 bg-[#090604]/85 border border-brand-orange/30 hover:border-brand-orange text-brand-orange rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 backdrop-blur-sm cursor-pointer"
          >
            <Navigation className="h-3.5 w-3.5" /> JUMP TO SUMO AREA
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#090604]/85 border border-[rgba(255,184,77,0.16)] p-3 rounded-xl font-mono text-[9px] uppercase tracking-wider space-y-1.5 pointer-events-auto backdrop-blur-sm">
        <span className="text-text-muted font-bold block mb-1">MAP SYMBOLOGY</span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-white" />
          <span className="text-blue-300">USER GPS POSITION</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-orange border border-white" />
          <span className="text-brand-orange">SUMO SIGNAL JUNCTION</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-emerald-300">MOVING VEHICLE ({vehicles.length})</span>
        </div>
      </div>

      {tileError && (
        <div className="absolute inset-0 bg-[#090604]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-3 font-mono p-6 border border-brand-orange/20">
          <AlertTriangle className="h-8 w-8 text-brand-orange animate-pulse" />
          <h4 className="font-bold text-white text-xs uppercase tracking-widest">MAP TILES OFFLINE</h4>
          <p className="text-text-pale text-[11px] max-w-xs">
            OpenStreetMap basemap tiles are currently unreachable. Signal junction overlays and vehicle markers remain active.
          </p>
          <button
            onClick={() => setTileError(false)}
            className="px-3 py-1 bg-white/5 border border-white/10 hover:border-brand-orange text-xs text-text-cream font-mono font-bold rounded-lg cursor-pointer pointer-events-auto"
          >
            RETRY TILES
          </button>
        </div>
      )}
    </div>
  );
};
