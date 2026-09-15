import hmac
import hashlib
import json
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_meta_challenge_handshake():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        params = {
            "hub.mode": "subscribe",
            "hub.verify_token": settings.META_VERIFY_TOKEN,
            "hub.challenge": "1158201244"
        }
        res = await ac.get("/api/v1/whatsapp/webhook", params=params)
        assert res.status_code == 200
        assert res.text == "1158201244"

@pytest.mark.asyncio
async def test_reject_invalid_hmac_signature():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        headers = {"X-Hub-Signature-256": "sha256=invalid_hash"}
        res = await ac.post("/api/v1/whatsapp/webhook", json={"entry": []}, headers=headers)
        assert res.status_code in [401, 403]

@pytest.mark.asyncio
async def test_accept_valid_hmac_signature():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = json.dumps({"entry": []}).encode("utf-8")
        signature = hmac.new(settings.META_APP_SECRET.encode("utf-8"), payload, hashlib.sha256).hexdigest()
        headers = {
            "X-Hub-Signature-256": f"sha256={signature}",
            "Content-Type": "application/json"
        }
        res = await ac.post("/api/v1/whatsapp/webhook", content=payload, headers=headers)
        assert res.status_code == 200
        assert res.json() == {"status": "received"}
