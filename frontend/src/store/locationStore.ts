import { create } from "zustand";
import { LocationState } from "../types";
import { reverseGeocode, resolveLocation } from "../api/locationService";

export interface LocationStoreState extends LocationState {
  showOnboardingModal: boolean;
  
  // Actions
  setShowOnboardingModal: (show: boolean) => void;
  detectBrowserLocation: () => Promise<void>;
  setManualLocation: (query: string) => Promise<void>;
  setManualCoordinates: (lat: number, lng: number, label?: string) => Promise<void>;
  toggleDemoMode: (enableDemo: boolean) => void;
  clearLocation: () => void;
}

const DEFAULT_DEMO_LOCATION = {
  latitude: 52.5200,
  longitude: 13.4050,
  accuracy: 15,
  timestamp: Date.now(),
  city: "Berlin",
  state: "Berlin Region",
  country: "Germany",
  locality: "Mitte Central",
  formattedAddress: "Berlin Mitte, SUMO City Network Grid",
  permissionStatus: "unknown" as const,
  source: "DEMO" as const,
  isDemoMode: true,
  loading: false,
  error: null,
  nearbyRoads: ["Unter den Linden", "Friedrichstraße", "Alexanderplatz Corridor", "Karl-Liebknecht-Straße"]
};

export const useLocationStore = create<LocationStoreState>((set, get) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  timestamp: null,
  city: null,
  state: null,
  country: null,
  locality: null,
  formattedAddress: null,
  permissionStatus: "unknown",
  source: "UNRESOLVED",
  isDemoMode: false,
  loading: false,
  error: null,
  nearbyRoads: [],
  showOnboardingModal: false,

  setShowOnboardingModal: (show) => set({ showOnboardingModal: show }),

  detectBrowserLocation: async () => {
    if (!navigator.geolocation) {
      set({
        loading: false,
        error: "Browser geolocation is not supported.",
        permissionStatus: "denied",
        source: "UNRESOLVED"
      });
      return;
    }

    set({ loading: true, error: null });

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = pos.coords.accuracy;
          const ts = pos.timestamp;

          set({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            timestamp: ts,
            permissionStatus: "granted",
            source: "GPS",
            isDemoMode: false,
            loading: true
          });

          // Query Reverse Geocoder
          try {
            const geoResult = await reverseGeocode(lat, lng);
            set({
              city: geoResult.city,
              state: geoResult.state,
              country: geoResult.country,
              locality: geoResult.locality,
              formattedAddress: geoResult.formatted_address,
              nearbyRoads: geoResult.nearby_roads,
              loading: false,
              error: null
            });
          } catch (e) {
            set({
              city: "Detected Coordinates Area",
              state: "Local Region",
              country: "User Location",
              locality: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
              formattedAddress: `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`,
              nearbyRoads: ["Local Access Road", "Regional Highway", "Metropolitan Expressway"],
              loading: false,
              error: null
            });
          }
          resolve();
        },
        (err) => {
          let errorMsg = "Unable to determine position.";
          if (err.code === err.PERMISSION_DENIED) {
            errorMsg = "Location permission denied by user.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errorMsg = "Location position unavailable.";
          } else if (err.code === err.TIMEOUT) {
            errorMsg = "Location request timed out.";
          }

          set({
            loading: false,
            error: errorMsg,
            permissionStatus: "denied",
            source: get().isDemoMode ? "DEMO" : "UNRESOLVED"
          });
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  setManualLocation: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const resolved = await resolveLocation(query);
      set({
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        accuracy: 50,
        timestamp: Date.now(),
        city: resolved.city,
        state: resolved.state,
        country: resolved.country,
        locality: resolved.locality,
        formattedAddress: resolved.formatted_address,
        nearbyRoads: resolved.nearby_roads,
        source: "MANUAL",
        isDemoMode: false,
        loading: false,
        error: null
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Failed to resolve search location."
      });
    }
  },

  setManualCoordinates: async (lat: number, lng: number, label?: string) => {
    set({ loading: true, error: null });
    try {
      const geoResult = await reverseGeocode(lat, lng);
      set({
        latitude: lat,
        longitude: lng,
        accuracy: 30,
        timestamp: Date.now(),
        city: geoResult.city,
        state: geoResult.state,
        country: geoResult.country,
        locality: label || geoResult.locality,
        formattedAddress: geoResult.formatted_address,
        nearbyRoads: geoResult.nearby_roads,
        source: "MANUAL",
        isDemoMode: false,
        loading: false,
        error: null
      });
    } catch (e) {
      set({
        latitude: lat,
        longitude: lng,
        accuracy: 30,
        timestamp: Date.now(),
        city: label || "Manual Location",
        state: "Region",
        country: "Manual Coordinates",
        locality: label || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
        formattedAddress: `Lat: ${lat.toFixed(4)}, Lon: ${lng.toFixed(4)}`,
        nearbyRoads: ["Main Traffic Road", "Connecting Expressway"],
        source: "MANUAL",
        isDemoMode: false,
        loading: false,
        error: null
      });
    }
  },

  toggleDemoMode: (enableDemo: boolean) => {
    if (enableDemo) {
      set({
        ...DEFAULT_DEMO_LOCATION,
        showOnboardingModal: false
      });
    } else {
      set({
        isDemoMode: false,
        source: "UNRESOLVED"
      });
      get().detectBrowserLocation();
    }
  },

  clearLocation: () => {
    set({
      latitude: null,
      longitude: null,
      accuracy: null,
      timestamp: null,
      city: null,
      state: null,
      country: null,
      locality: null,
      formattedAddress: null,
      source: "UNRESOLVED",
      isDemoMode: false,
      loading: false,
      error: null,
      nearbyRoads: []
    });
  }
}));
