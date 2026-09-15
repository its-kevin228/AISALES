import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.models.entities import Order, OrderLine, Customer, Product
from app.schemas.entities import OrderCreate

async def get_or_create_customer(db: AsyncSession, phone_number: str) -> Customer:
    stmt = select(Customer).where(Customer.phone_number == phone_number)
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        customer = Customer(
            phone_number=phone_number,
            name=f"Client {phone_number[-4:]}"
        )
        db.add(customer)
        await db.commit()
        await db.refresh(customer)
    return customer

async def create_draft_order(db: AsyncSession, data: OrderCreate) -> Order:
    customer = await get_or_create_customer(db, data.customer_phone)
    order_num = f"CMD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    
    order = Order(
        order_number=order_num,
        customer_id=customer.id,
        status="draft",
        total_amount=0
    )
    db.add(order)
    await db.flush()
    
    total = 0
    for item in data.items:
        prod_stmt = select(Product).where(Product.code == item.product_code)
        prod_res = await db.execute(prod_stmt)
        product = prod_res.scalar_one_or_none()
        if not product:
            continue
        subtotal = product.unit_price * item.quantity
        line = OrderLine(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.unit_price,
            subtotal=subtotal
        )
        db.add(line)
        total += subtotal
        
    order.total_amount = total
    await db.commit()
    
    # Reload with lines
    res = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.lines))
    )
    return res.scalar_one()

async def confirm_order(db: AsyncSession, order_id: uuid.UUID) -> Optional[Order]:
    res = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.lines))
    )
    order = res.scalar_one_or_none()
    if not order:
        return None
    if order.status not in ["draft", "pending_validation"]:
        return order
        
    # Deduct stock for each line
    for line in order.lines:
        await db.execute(
            update(Product)
            .where(Product.id == line.product_id)
            .values(stock_quantity=Product.stock_quantity - line.quantity)
        )
        
    order.status = "confirmed"
    await db.commit()
    await db.refresh(order)
    return order

async def list_orders(db: AsyncSession, status: Optional[str] = None) -> List[Order]:
    stmt = select(Order).options(selectinload(Order.lines)).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    res = await db.execute(stmt)
    return list(res.scalars().all())

async def get_order_by_id(db: AsyncSession, order_id: uuid.UUID) -> Optional[Order]:
    res = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.lines))
    )
    return res.scalar_one_or_none()
