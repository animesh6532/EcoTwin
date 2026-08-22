import { useSimulationStore } from "../store/simulationStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws/simulation";

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval = 3000;
  private maxReconnectAttempts = 10;
  private reconnectAttempts = 0;
  private isIntentionalDisconnect = false;
  private heartbeatInterval: number | null = null;

  connect() {
    this.isIntentionalDisconnect = false;
    const store = useSimulationStore.getState();
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log(`Connecting to EcoTwin WebSocket: ${WS_URL}`);
    store.setConnectionState("connecting");
    
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log("EcoTwin WebSocket stream established.");
      this.reconnectAttempts = 0;
      store.setConnectionState("connected");
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        // Handle pong
        if (payload.type === "pong") {
          return;
        }

        // Handle simulation state updates from backend
        if (payload.type === "simulation_state") {
          store.updateSimulationState({
            simulation_time: payload.simulation_time,
            vehicles: payload.vehicles,
            traffic_lights: payload.traffic_lights,
            metrics: payload.metrics,
            pollution: payload.pollution,
          });
          store.fetchSimulationMetrics();
        }
      } catch (err) {
        console.error("Error parsing WebSocket JSON payload:", err);
      }
    };

    this.socket.onclose = (event) => {
      console.warn(`EcoTwin WebSocket disconnected. Code: ${event.code}`);
      store.setConnectionState("disconnected");
      this.stopHeartbeat();

      if (!this.isIntentionalDisconnect) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error("EcoTwin WebSocket connection error:", error);
      store.setConnectionState("error");
      this.socket?.close();
    };
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 15000); // Send ping every 15 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Critical: Max WebSocket reconnect attempts reached.");
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling auto-reconnect in ${this.reconnectInterval}ms (Attempt ${this.reconnectAttempts})...`);
    setTimeout(() => {
      if (!this.isIntentionalDisconnect) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    useSimulationStore.getState().setConnectionState("disconnected");
  }
}

export const webSocketService = new WebSocketService();
