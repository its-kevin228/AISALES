import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.entities import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[str] = Query(None, description="Filtrer par statut (draft, pending_validation, confirmed, etc.)"),
    db: AsyncSession = Depends(get_db)
):
    return await order_service.list_orders(db, status=status)

@router.post("/draft", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_draft_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await order_service.create_draft_order(db, data)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    order = await order_service.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return order

@router.post("/{order_id}/confirm", response_model=OrderResponse)
async def confirm_order(order_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    order = await order_service.confirm_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvée")
    return order
