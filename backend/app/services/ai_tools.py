from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.entities import Product, Customer, Conversation
from app.schemas.entities import OrderCreate, OrderLineCreate
from app.services import order_service

async def get_product_availability(keyword: str, db: AsyncSession) -> Dict[str, Any]:
    stmt = select(Product).where(
        Product.is_active == True,
        Product.name.ilike(f"%{keyword}%") | Product.code.ilike(f"%{keyword}%") | Product.category.ilike(f"%{keyword}%")
    )
    res = await db.execute(stmt)
    products = list(res.scalars().all())
    
    return {
        "found": len(products) > 0,
        "count": len(products),
        "products": [
            {
                "code": p.code,
                "name": p.name,
                "category": p.category,
                "unit_price": p.unit_price,
                "stock_quantity": p.stock_quantity,
                "in_stock": p.stock_quantity > 0
            }
            for p in products
        ]
    }

async def create_or_update_draft_order(customer_phone: str, items: List[Dict[str, Any]], db: AsyncSession) -> Dict[str, Any]:
    order_data = OrderCreate(
        customer_phone=customer_phone,
        items=[OrderLineCreate(product_code=i["product_code"], quantity=int(i["quantity"])) for i in items]
    )
    order = await order_service.create_draft_order(db, order_data)
    return {
        "success": True,
        "order_id": str(order.id),
        "order_number": order.order_number,
        "total_amount": order.total_amount,
        "items_count": len(order.lines)
    }

async def trigger_human_handover(customer_phone: str, reason: str, db: AsyncSession) -> Dict[str, Any]:
    customer = await order_service.get_or_create_customer(db, customer_phone)
    stmt = select(Conversation).where(Conversation.customer_id == customer.id)
    res = await db.execute(stmt)
    conversation = res.scalar_one_or_none()
    
    if not conversation:
        conversation = Conversation(customer_id=customer.id, status="human_handover")
        db.add(conversation)
    else:
        conversation.status = "human_handover"
        
    await db.commit()
    return {
        "handover_active": True,
        "status": "human_handover",
        "customer_phone": customer_phone,
        "reason": reason
    }

TOOL_REGISTRY = {
    "get_product_availability": get_product_availability,
    "create_or_update_draft_order": create_or_update_draft_order,
    "trigger_human_handover": trigger_human_handover
}

async def execute_tool(tool_name: str, args: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
    if tool_name not in TOOL_REGISTRY:
        return {"error": f"Tool '{tool_name}' not found"}
    handler = TOOL_REGISTRY[tool_name]
    return await handler(**args, db=db)
