import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_create_and_fetch_product():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        unique_sku = f"FER-{uuid.uuid4().hex[:6].upper()}"
        new_prod = {
            "code": unique_sku,
            "name": "Barre de fer 12mm",
            "category": "Métallurgie",
            "unit_price": 6500,
            "stock_quantity": 120,
            "is_active": True
        }
        create_res = await ac.post("/api/v1/products", json=new_prod)
        assert create_res.status_code == 201
        data = create_res.json()
        assert data["code"] == unique_sku
        prod_id = data["id"]
        
        fetch_res = await ac.get("/api/v1/products")
        assert fetch_res.status_code == 200
        products = fetch_res.json()
        assert any(p["code"] == unique_sku for p in products)
        
        # Test stock update
        stock_res = await ac.patch(f"/api/v1/products/{prod_id}/stock", json={"stock_quantity": 95})
        assert stock_res.status_code == 200
        assert stock_res.json()["stock_quantity"] == 95
