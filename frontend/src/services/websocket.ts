import { simulationStore } from '../store/simulationStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval = 3000;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log('EcoTwin WebSocket connected successfully.');
      this.reconnectAttempts = 0;
      simulationStore.setState({ status: 'running' });
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'state_update') {
          simulationStore.setState({
            step: payload.step,
            vehicles: payload.vehicles,
            signals: payload.signals,
            active_vehicles: payload.vehicles.length,
            emissions: payload.emissions
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket state frame:', err);
      }
    };

    this.socket.onclose = () => {
      console.log('EcoTwin WebSocket closed.');
      simulationStore.setState({ status: 'stopped' });
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('EcoTwin WebSocket encountered error:', error);
      this.socket?.close();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnect attempts reached.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting WebSocket in ${this.reconnectInterval}ms (Attempt ${this.reconnectAttempts})...`);
    setTimeout(() => this.connect(), this.reconnectInterval);
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const webSocketService = new WebSocketService();
