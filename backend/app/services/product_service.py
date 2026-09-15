import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.entities import Product
from app.schemas.entities import ProductCreate

async def list_products(db: AsyncSession) -> List[Product]:
    res = await db.execute(select(Product).order_by(Product.name))
    return list(res.scalars().all())

async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

async def update_stock(db: AsyncSession, product_id: uuid.UUID, new_quantity: int) -> Optional[Product]:
    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(stock_quantity=new_quantity)
    )
    await db.commit()
    res = await db.execute(select(Product).where(Product.id == product_id))
    return res.scalar_one_or_none()
