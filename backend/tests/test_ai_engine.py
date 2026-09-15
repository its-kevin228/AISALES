import uuid
import pytest
from app.core.database import AsyncSessionLocal
from app.services.product_service import create_product
from app.schemas.entities import ProductCreate
from app.services.ai_tools import execute_tool

@pytest.mark.asyncio
async def test_get_product_availability_tool():
    async with AsyncSessionLocal() as db:
        unique_sku = f"TOLE-{uuid.uuid4().hex[:6].upper()}"
        await create_product(db, ProductCreate(
            code=unique_sku,
            name="Tôle Bac Alu 0.35mm",
            category="Couverture",
            unit_price=8500,
            stock_quantity=60,
            is_active=True
        ))
        
        result = await execute_tool("get_product_availability", {"keyword": "Tôle"}, db)
        assert result["found"] is True
        assert any(p["code"] == unique_sku for p in result["products"])

@pytest.mark.asyncio
async def test_create_draft_order_tool():
    async with AsyncSessionLocal() as db:
        unique_sku = f"POINT-{uuid.uuid4().hex[:6].upper()}"
        await create_product(db, ProductCreate(
            code=unique_sku,
            name="Pointes 80mm",
            category="Quincaillerie",
            unit_price=1200,
            stock_quantity=100,
            is_active=True
        ))
        
        phone = f"+225{uuid.uuid4().int % 1000000000:09d}"
        args = {
            "customer_phone": phone,
            "items": [{"product_code": unique_sku, "quantity": 5}]
        }
        result = await execute_tool("create_or_update_draft_order", args, db)
        assert result["success"] is True
        assert result["total_amount"] == 6000
        assert "CMD-" in result["order_number"]

@pytest.mark.asyncio
async def test_trigger_human_handover_tool():
    async with AsyncSessionLocal() as db:
        phone = f"+225{uuid.uuid4().int % 1000000000:09d}"
        args = {
            "customer_phone": phone,
            "reason": "Client mécontent d'une précédente livraison"
        }
        result = await execute_tool("trigger_human_handover", args, db)
        assert result["handover_active"] is True
        assert result["status"] == "human_handover"
