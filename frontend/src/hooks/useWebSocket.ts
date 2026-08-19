import { useEffect } from 'react';
import { webSocketService } from '../services/websocket';

export function useWebSocket() {
  useEffect(() => {
    webSocketService.connect();
    return () => {
      webSocketService.disconnect();
    };
  }, []);
}
