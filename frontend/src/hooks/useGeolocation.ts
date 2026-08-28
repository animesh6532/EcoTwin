import { useState, useEffect, useCallback } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionState: PermissionState | "unknown";
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permissionState: "unknown",
  });

  // Query Permission State
  const updatePermissionState = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return;
    }
    try {
      const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      setState((prev) => ({ ...prev, permissionState: status.state }));
      
      status.onchange = () => {
        setState((prev) => ({ ...prev, permissionState: status.state }));
      };
    } catch (e) {
      // Ignore query failure
    }
  }, []);

  useEffect(() => {
    updatePermissionState();
  }, [updatePermissionState]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by this browser.",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        }));
        // Trigger updating permission status in case it was just granted
        updatePermissionState();
      },
      (error) => {
        let errorMsg = "Your location could not be determined.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission was denied.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Your location could not be determined.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out.";
        }
        
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        updatePermissionState();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 0,
      }
    );
  }, [updatePermissionState]);

  const clearLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: false,
      error: null,
    }));
  }, []);

  return {
    ...state,
    detectLocation,
    clearLocation,
  };
}
