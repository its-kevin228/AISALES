import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ProductBase(BaseModel):
    code: str
    name: str
    category: str
    unit_price: int
    stock_quantity: int
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdateStock(BaseModel):
    stock_quantity: int

class ProductResponse(ProductBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)

class OrderLineCreate(BaseModel):
    product_code: str
    quantity: int

class OrderLineResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    unit_price: int
    subtotal: int
    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    customer_phone: str
    items: List[OrderLineCreate]

class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_id: uuid.UUID
    status: str
    total_amount: int
    receipt_url: Optional[str] = None
    receipt_data: Optional[dict] = None
    created_at: datetime
    lines: List[OrderLineResponse] = []
    model_config = ConfigDict(from_attributes=True)

class CustomerResponse(BaseModel):
    id: uuid.UUID
    phone_number: str
    name: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
