import { useEffect } from 'react';
import { webSocketService } from '../services/websocket';

export function useWebSocket(currentPath: string) {
  useEffect(() => {
    if (currentPath !== "/") {
      webSocketService.connect();
      return () => {
        webSocketService.disconnect();
      };
    }
  }, [currentPath]);
}
