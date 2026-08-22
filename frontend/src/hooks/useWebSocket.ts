import { useEffect } from 'react';
import { webSocketService } from '../services/websocket';

export function useWebSocket(currentPath: string) {
  const isDashboard = currentPath !== "/";

  useEffect(() => {
    if (isDashboard) {
      webSocketService.connect();
    } else {
      webSocketService.disconnect();
    }
    return () => {
      if (isDashboard) {
        webSocketService.disconnect();
      }
    };
  }, [isDashboard]);
}
