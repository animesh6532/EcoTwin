import json
from fastapi import WebSocket, WebSocketDisconnect
from backend.websocket.manager import manager
from backend.core.logging import logger

async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for streaming live simulation states to dashboard clients.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for control actions or pings from frontend client
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                event_type = payload.get("type")
                if event_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                else:
                    logger.debug(f"Received WebSocket message: {payload}")
            except json.JSONDecodeError:
                logger.warning(f"Malformed WebSocket frame: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket connection exception: {e}")
        manager.disconnect(websocket)
