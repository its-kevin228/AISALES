import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_complete_end_to_end_sales_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Health check
        health_res = await client.get("/api/v1/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "healthy"

        # Step 2: Create product in catalog
        sku = f"FER-{uuid.uuid4().hex[:6].upper()}"
        product_payload = {
            "code": sku,
            "name": "Fer a beton 12mm Haute Adherence",
            "category": "Ferraillage",
            "unit_price": 6500,
            "stock_quantity": 30,
            "is_active": True
        }
        prod_res = await client.post("/api/v1/products", json=product_payload)
        assert prod_res.status_code == 201
        created_product = prod_res.json()
        assert created_product["code"] == sku
        assert created_product["stock_quantity"] == 30

        # Step 3: Customer creates draft order quotation
        customer_phone = f"+22507{uuid.uuid4().int % 100000000:08d}"
        draft_payload = {
            "customer_phone": customer_phone,
            "items": [
                {
                    "product_code": sku,
                    "quantity": 4
                }
            ]
        }
        draft_res = await client.post("/api/v1/orders/draft", json=draft_payload)
        assert draft_res.status_code == 201
        order = draft_res.json()
        order_id = order["id"]
        assert order["status"] == "draft"
        assert order["total_amount"] == 26000
        assert len(order["lines"]) == 1
        assert order["lines"][0]["subtotal"] == 26000

        # Step 4: Customer submits Mobile Money payment receipt
        tx_ref = f"WAVE-E2E-{uuid.uuid4().hex[:8].upper()}"
        receipt_payload = {
            "receipt_url": "https://storage.omnisales.ai/proofs/wave-transfer-e2e.jpg",
            "receipt_data": {
                "operator": "Wave",
                "transaction_ref": tx_ref,
                "amount": 26000,
                "currency": "FCFA",
                "sender_phone": customer_phone,
                "timestamp": "2026-09-15T15:30:00Z"
            }
        }
        receipt_res = await client.post(f"/api/v1/orders/{order_id}/receipt", json=receipt_payload)
        assert receipt_res.status_code == 200
        updated_order = receipt_res.json()
        assert updated_order["status"] == "pending_validation"
        assert updated_order["receipt_data"]["transaction_ref"] == tx_ref

        # Step 5: Anti-fraud duplicate detection
        # Attempt to use the same transaction ref on another draft order
        order_2_res = await client.post("/api/v1/orders/draft", json={
            "customer_phone": customer_phone,
            "items": [{"product_code": sku, "quantity": 1}]
        })
        assert order_2_res.status_code == 201
        order_2_id = order_2_res.json()["id"]

        duplicate_res = await client.post(f"/api/v1/orders/{order_2_id}/receipt", json={
            "receipt_url": "https://storage.omnisales.ai/proofs/fraud-attempt.jpg",
            "receipt_data": {
                "operator": "Wave",
                "transaction_ref": tx_ref,
                "amount": 26000
            }
        })
        assert duplicate_res.status_code == 409
        assert "doublon" in duplicate_res.json()["detail"].lower()

        # Step 6: Human-in-the-Loop operator confirmation (1-click)
        confirm_res = await client.post(f"/api/v1/orders/{order_id}/confirm")
        assert confirm_res.status_code == 200
        confirmed_order = confirm_res.json()
        assert confirmed_order["status"] == "confirmed"

        # Step 7: Atomic stock deduction verification (30 - 4 = 26)
        all_products_res = await client.get("/api/v1/products")
        assert all_products_res.status_code == 200
        target_product = next(p for p in all_products_res.json() if p["code"] == sku)
        assert target_product["stock_quantity"] == 26

        # Step 8: Idempotent confirmation (confirming again does not deduct stock twice)
        double_confirm_res = await client.post(f"/api/v1/orders/{order_id}/confirm")
        assert double_confirm_res.status_code == 200
        assert double_confirm_res.json()["status"] == "confirmed"

        # Verify stock remains strictly at 26
        check_stock_res = await client.get("/api/v1/products")
        rechecked_product = next(p for p in check_stock_res.json() if p["code"] == sku)
        assert rechecked_product["stock_quantity"] == 26
