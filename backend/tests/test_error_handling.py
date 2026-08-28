import os
import datetime

from fastapi.testclient import TestClient


def test_no_api_key_falls_back_gracefully(monkeypatch):
    # Deleting the env var isn't enough on a machine with a real backend/.env
    # file: main.py's load_dotenv() on import would just read the key back
    # off disk. Patch the service layer directly so this test simulates "no
    # live access" deterministically, without depending on machine state or
    # making a real network call.
    import services.fortyguard_service as fg

    def _raise():
        raise fg.FortyGuardUnavailable("no key configured (test)")

    monkeypatch.setattr(fg, "get_client", _raise)

    from main import app
    client = TestClient(app)

    r = client.post("/api/analyze", json={
        "locations": [{"name": "Phoenix Construction Zone", "latitude": 33.4484, "longitude": -112.0740}],
        "analysis_date": "2026-07-15",
        "analysis_hour": "14:00",
        "demo_mode": False,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["demo_mode"] is True  # no key -> falls back, doesn't error


def test_invalid_location_returns_422():
    from main import app
    client = TestClient(app)
    r = client.post("/api/analyze", json={
        "locations": [{"name": "Bad", "latitude": 999.0, "longitude": -112.0}],
        "analysis_date": "2026-07-15",
    })
    assert r.status_code == 422


def test_history_detail_404_for_unknown_id():
    from main import app
    client = TestClient(app)
    r = client.get("/api/history/does-not-exist")
    assert r.status_code == 404


def test_status_endpoint_never_leaks_api_key(monkeypatch):
    monkeypatch.setenv("FORTYGUARD_API_KEY", "secret-key-value")
    from main import app
    client = TestClient(app)
    r = client.get("/api/status")
    assert "secret-key-value" not in r.text