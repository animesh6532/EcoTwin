import asyncio
import json
from fastapi import WebSocket
from typing import List
from backend.core.logging import logger

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.warning(f"Error sending message to client: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
            
        message_str = json.dumps(message)
        tasks = []
        for connection in self.active_connections:
            tasks.append(self._safe_send(connection, message_str))
            
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _safe_send(self, websocket: WebSocket, message_str: str):
        try:
            await websocket.send_text(message_str)
        except Exception as e:
            logger.warning(f"Error broadcasting message to WebSocket client: {e}")
            self.disconnect(websocket)

# Singleton WebSocket manager
manager = ConnectionManager()
