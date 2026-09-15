import pytest
from app.schemas.entities import ProductCreate, OrderCreate, OrderLineCreate

def test_product_schema_validation():
    prod = ProductCreate(
        code="CIM-001",
        name="Ciment Dangote 50kg",
        category="Gros Oeuvre",
        unit_price=4900,
        stock_quantity=80
    )
    assert prod.code == "CIM-001"
    assert prod.unit_price == 4900

def test_order_schema_validation():
    order = OrderCreate(
        customer_phone="+2250700000000",
        items=[OrderLineCreate(product_code="CIM-001", quantity=3)]
    )
    assert len(order.items) == 1
    assert order.items[0].quantity == 3
