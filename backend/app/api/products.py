import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.entities import ProductCreate, ProductResponse, ProductUpdateStock
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    return await product_service.list_products(db)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await product_service.create_product(db, data)

@router.patch("/{product_id}/stock", response_model=ProductResponse)
async def update_product_stock(
    product_id: uuid.UUID, 
    body: ProductUpdateStock, 
    db: AsyncSession = Depends(get_db)
):
    updated = await product_service.update_stock(db, product_id, body.stock_quantity)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated
