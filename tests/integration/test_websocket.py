import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_websocket_connection():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/simulation") as websocket:
            # Ping
            websocket.send_json({"type": "ping"})
            data = websocket.receive_json()
            assert data == {"type": "pong"}
