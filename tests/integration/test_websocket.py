import pytest
from fastapi.testclient import TestClient
from backend.main import app

def test_websocket_connection():
    client = TestClient(app)
    with client.websocket_connect("/ws") as websocket:
        # Ping
        websocket.send_json({"action": "ping"})
        data = websocket.receive_json()
        assert data == {"type": "pong"}
