import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.entities import Order

async def validate_receipt_uniqueness(transaction_ref: str, db: AsyncSession) -> bool:
    if not transaction_ref:
        return False
    stmt = select(Order).where(Order.receipt_data["transaction_ref"].astext == transaction_ref)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    return existing is None

async def attach_receipt_to_order(
    order_id: uuid.UUID,
    receipt_url: str,
    receipt_data: Dict[str, Any],
    db: AsyncSession
) -> Optional[Order]:
    res = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.lines))
    )
    order = res.scalar_one_or_none()
    if not order:
        return None
        
    order.receipt_url = receipt_url
    order.receipt_data = receipt_data
    order.status = "pending_validation"
    
    await db.commit()
    await db.refresh(order)
    return order
