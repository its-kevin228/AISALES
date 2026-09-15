import uuid
import pytest
from app.core.database import AsyncSessionLocal
from app.services.receipt_ocr_service import validate_receipt_uniqueness, attach_receipt_to_order
from app.services.order_service import create_draft_order
from app.services.product_service import create_product
from app.schemas.entities import OrderCreate, OrderLineCreate, ProductCreate

@pytest.mark.asyncio
async def test_receipt_ocr_and_duplicate_prevention():
    async with AsyncSessionLocal() as db:
        unique_sku = f"CIM-{uuid.uuid4().hex[:6].upper()}"
        await create_product(db, ProductCreate(
            code=unique_sku,
            name="Ciment Test",
            category="Test",
            unit_price=5000,
            stock_quantity=20,
            is_active=True
        ))
        
        phone = f"+225{uuid.uuid4().int % 1000000000:09d}"
        order = await create_draft_order(db, OrderCreate(
            customer_phone=phone,
            items=[OrderLineCreate(product_code=unique_sku, quantity=2)]
        ))
        
        tx_ref = f"WAVE-CI-{uuid.uuid4().hex[:8].upper()}"
        # 1. First time checking uniqueness: True
        is_unique = await validate_receipt_uniqueness(tx_ref, db)
        assert is_unique is True
        
        # 2. Attach receipt to order
        receipt_data = {
            "operator": "Wave",
            "transaction_ref": tx_ref,
            "amount": 10000,
            "currency": "FCFA",
            "sender_phone": phone
        }
        updated_order = await attach_receipt_to_order(
            order_id=order.id,
            receipt_url="https://storage.omnisales.ai/receipts/test.jpg",
            receipt_data=receipt_data,
            db=db
        )
        assert updated_order.status == "pending_validation"
        assert updated_order.receipt_data["transaction_ref"] == tx_ref
        
        # 3. Second time checking uniqueness: False (blocked duplicate!)
        is_unique_again = await validate_receipt_uniqueness(tx_ref, db)
        assert is_unique_again is False
