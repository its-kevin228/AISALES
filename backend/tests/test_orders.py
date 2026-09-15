import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_order_human_confirmation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # First, ensure product exists
        unique_sku = f"CIM-{uuid.uuid4().hex[:6].upper()}"
        prod_payload = {
            "code": unique_sku,
            "name": "Ciment Dangote 50kg",
            "category": "Gros Oeuvre",
            "unit_price": 5000,
            "stock_quantity": 50,
            "is_active": True
        }
        prod_res = await ac.post("/api/v1/products", json=prod_payload)
        assert prod_res.status_code == 201
        
        # Create draft order
        phone = f"+225{uuid.uuid4().int % 1000000000:09d}"
        draft_payload = {
            "customer_phone": phone,
            "items": [{"product_code": unique_sku, "quantity": 3}]
        }
        res = await ac.post("/api/v1/orders/draft", json=draft_payload)
        assert res.status_code == 201
        order = res.json()
        assert order["status"] == "draft"
        assert order["total_amount"] == 15000
        order_id = order["id"]
        
        # Confirm order via Human-in-the-Loop endpoint
        confirm_res = await ac.post(f"/api/v1/orders/{order_id}/confirm")
        assert confirm_res.status_code == 200
        confirmed_order = confirm_res.json()
        assert confirmed_order["status"] == "confirmed"
        
        # Verify stock was deducted (50 - 3 = 47)
        products_res = await ac.get("/api/v1/products")
        for p in products_res.json():
            if p["code"] == unique_sku:
                assert p["stock_quantity"] == 47
