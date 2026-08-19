import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect
from typing import List
from backend.core.logging import logger

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        
        message_str = json.dumps(message)
        tasks = []
        for connection in self.active_connections:
            tasks.append(connection.send_text(message_str))
            
        # Parallel broadcast
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for i, res in enumerate(results):
            if isinstance(res, Exception):
                logger.warning(f"Error sending ws broadcast to connection: {res}")
                # We do not disconnect directly here; WebSocketDisconnect is handled in the endpoint read loop

manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Client can send commands or ping messages
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                # Handle control messages if any
                action = payload.get("action")
                if action == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                else:
                    logger.debug(f"Received websocket frame: {payload}")
            except json.JSONDecodeError:
                logger.warning(f"Malformed websocket frame: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket endpoint exception: {e}")
        manager.disconnect(websocket)
