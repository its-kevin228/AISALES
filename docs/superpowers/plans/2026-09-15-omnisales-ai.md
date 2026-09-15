# WhatsApp AI Commerce Copilot (omnisales-ai) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, decoupled SaaS platform (FastAPI backend + Next.js 16 frontend + PostgreSQL 18) for WhatsApp-driven B2B/B2C commerce, featuring multimodal AI (audio, image, text), strict Human-in-the-Loop order validation, and a Linear-inspired high-density web cockpit.

**Architecture:** A modern decoupled monorepo architecture. The backend is an asynchronous FastAPI 0.115+ service orchestrating Meta WhatsApp Cloud API webhooks, Google Gemini Function Calling, and Whisper transcription with a PostgreSQL 18 database. The frontend is a Next.js 16 (React 19) App Router application implementing a strict Linear and Stripe design system without fake simulator widgets or AI design cliches.

**Tech Stack:** 
- Backend: Python 3.12, FastAPI 0.115+, SQLAlchemy 2.0 (Async), Pydantic v2, PostgreSQL 18, Pytest, Uvicorn.
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- AI Services: Google Gemini 2.0 (Pro / Flash for Function Calling and Vision OCR), OpenAI Whisper for Speech-to-Text.

**Spec:** [docs/superpowers/specs/2026-09-15-omnisales-ai-design.md](file:///c:/Users/Kevin/Documents/PROJET/AISALES/docs/superpowers/specs/2026-09-15-omnisales-ai-design.md)

## Global Constraints

- Never use em-dashes in customer copy or documentation.
- No fake smartphone simulator widgets in the web application.
- Use the Linear design system (near-black palette #010102, charcoal panels #0f1011, 1px borders #23252a, tabular numbers).
- Human-in-the-Loop is mandatory: AI cannot mark an order as confirmed, paid, or shipped unilaterally.
- Meta Webhook requests must always pass HMAC SHA-256 validation.

---

### Task 1: Backend Scaffolding, Configuration & Database Setup

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/core/config.py`
- Create: `backend/app/core/database.py`
- Create: `backend/app/main.py`
- Test: `backend/tests/test_health.py`

**Interfaces:**
- Produces: `get_settings() -> Settings`, `get_db() -> AsyncGenerator[AsyncSession, None]`, `app: FastAPI`.

- [ ] **Step 1: Write the failing test for health endpoint**

```python
# backend/tests/test_health.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "omnisales-ai-backend"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_health.py`
Expected: FAIL (ModuleNotFoundError: No module named 'app')

- [ ] **Step 3: Create dependencies and minimal FastAPI app**

Write `backend/requirements.txt`:
```text
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.8.0
pydantic-settings>=2.4.0
sqlalchemy>=2.0.32
asyncpg>=0.29.0
alembic>=1.13.2
httpx>=0.27.0
pytest>=8.3.2
pytest-asyncio>=0.23.8
python-dotenv>=1.0.1
```

Write `backend/app/core/config.py`:
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "omnisales-ai"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/omnisales"
    META_VERIFY_TOKEN: str = "dev_verify_token"
    META_APP_SECRET: str = "dev_app_secret"
    META_ACCESS_TOKEN: str = "dev_access_token"
    GEMINI_API_KEY: str = "dev_gemini_key"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
```

Write `backend/app/core/database.py`:
```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

Write `backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(f"{settings.API_V1_STR}/health")
async def health_check():
    return {"status": "healthy", "service": "omnisales-ai-backend"}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_health.py`
Expected: PASS (status code 200, healthy)

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat(backend): scaffold FastAPI app with configuration and healthcheck"
```

---

### Task 2: SQLAlchemy Models & Schemas

**Files:**
- Create: `backend/app/models/entities.py`
- Create: `backend/app/schemas/entities.py`
- Test: `backend/tests/test_models.py`

**Interfaces:**
- Consumes: `Base` from `app.core.database`.
- Produces: `Customer`, `Product`, `Order`, `OrderLine`, `Conversation`, `Message` models and Pydantic schemas.

- [ ] **Step 1: Write unit test for model instantiation and serialization**

```python
# backend/tests/test_models.py
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_models.py`
Expected: FAIL (No module named `app.schemas.entities`)

- [ ] **Step 3: Implement SQLAlchemy models and Pydantic schemas**

Write `backend/app/models/entities.py`:
```python
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="customer")
    conversations = relationship("Conversation", back_populates="customer")

class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Order(Base):
    __tablename__ = "orders"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    total_amount: Mapped[int] = mapped_column(Integer, default=0)
    receipt_url: Mapped[str] = mapped_column(Text, nullable=True)
    receipt_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="orders")
    lines = relationship("OrderLine", back_populates="order", cascade="all, delete-orphan")

class OrderLine(Base):
    __tablename__ = "order_lines"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[int] = mapped_column(Integer, nullable=False)
    
    order = relationship("Order", back_populates="lines")
    product = relationship("Product")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="bot", index=True)
    last_activity_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    direction: Mapped[str] = mapped_column(String(10), nullable=False)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=True)
    media_url: Mapped[str] = mapped_column(Text, nullable=True)
    media_type: Mapped[str] = mapped_column(String(20), default="text")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    conversation = relationship("Conversation", back_populates="messages")
```

Write `backend/app/schemas/entities.py`:
```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_models.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/ backend/app/schemas/ backend/tests/test_models.py
git commit -m "feat(backend): add SQLAlchemy models and Pydantic schemas"
```

---

### Task 3: Products & Stock Service and REST API

**Files:**
- Create: `backend/app/services/product_service.py`
- Create: `backend/app/api/products.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_products.py`

**Interfaces:**
- Produces: `GET /api/v1/products`, `POST /api/v1/products`, `PATCH /api/v1/products/{id}/stock`.

- [ ] **Step 1: Write integration test for product CRUD**

```python
# backend/tests/test_products.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_create_and_fetch_product():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        new_prod = {
            "code": "FER-12",
            "name": "Barre de fer 12mm",
            "category": "Métallurgie",
            "unit_price": 6500,
            "stock_quantity": 120,
            "is_active": True
        }
        create_res = await ac.post("/api/v1/products", json=new_prod)
        assert create_res.status_code == 201
        data = create_res.json()
        assert data["code"] == "FER-12"
        
        fetch_res = await ac.get("/api/v1/products")
        assert fetch_res.status_code == 200
        products = fetch_res.json()
        assert any(p["code"] == "FER-12" for p in products)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_products.py`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Implement product service and router**

Write `backend/app/services/product_service.py`:
```python
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

async def update_stock(db: AsyncSession, product_id: str, new_quantity: int) -> Optional[Product]:
    await db.execute(
        update(Product)
        .where(Product.id == product_id)
        .values(stock_quantity=new_quantity)
    )
    await db.commit()
    res = await db.execute(select(Product).where(Product.id == product_id))
    return res.scalar_one_or_none()
```

Write `backend/app/api/products.py`:
```python
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
    updated = await product_service.update_stock(db, str(product_id), body.stock_quantity)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated
```

Modify `backend/app/main.py`: Include `products.router` under `api_v1`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_products.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/product_service.py backend/app/api/products.py backend/app/main.py backend/tests/test_products.py
git commit -m "feat(backend): add product and inventory REST endpoints"
```

---

### Task 4: Orders & Human-in-the-Loop Validation Service

**Files:**
- Create: `backend/app/services/order_service.py`
- Create: `backend/app/api/orders.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_orders.py`

**Interfaces:**
- Produces: `POST /api/v1/orders/confirm/{id}`, `GET /api/v1/orders`, `POST /api/v1/orders/draft`.

- [ ] **Step 1: Write test for 1-click human confirmation and stock deduction**

```python
# backend/tests/test_orders.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_order_human_confirmation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create draft order
        draft_payload = {
            "customer_phone": "+2250102030405",
            "items": [{"product_code": "FER-12", "quantity": 2}]
        }
        res = await ac.post("/api/v1/orders/draft", json=draft_payload)
        assert res.status_code == 201
        order = res.json()
        assert order["status"] == "draft"
        order_id = order["id"]
        
        # Confirm order via Human-in-the-Loop endpoint
        confirm_res = await ac.post(f"/api/v1/orders/{order_id}/confirm")
        assert confirm_res.status_code == 200
        confirmed_order = confirm_res.json()
        assert confirmed_order["status"] == "confirmed"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_orders.py`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Implement order creation and confirmation logic**

Write `backend/app/services/order_service.py`:
- Create draft order with automatic subtotal calculation and customer auto-registration.
- Confirm order: verify status is `draft` or `pending_validation`, switch status to `confirmed`, and atomically deduct inventory quantities.

Write `backend/app/api/orders.py`:
- `POST /draft`: Create new proforma order.
- `GET /`: List orders with filtering by status.
- `POST /{id}/confirm`: 1-click Human validation endpoint.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_orders.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/order_service.py backend/app/api/orders.py backend/tests/test_orders.py
git commit -m "feat(backend): implement orders service with human confirmation gate"
```

---

### Task 5: Meta WhatsApp Webhook & Cryptographic Verification

**Files:**
- Create: `backend/app/core/security.py`
- Create: `backend/app/api/whatsapp.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_webhook.py`

**Interfaces:**
- Produces: `GET /api/v1/whatsapp/webhook` (hub.challenge handshake), `POST /api/v1/whatsapp/webhook` (HMAC SHA-256 validated receiver).

- [ ] **Step 1: Write test for handshake and HMAC validation**

```python
# backend/tests/test_webhook.py
import pytest
import hmac
import hashlib
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_meta_challenge_handshake():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        params = {
            "hub.mode": "subscribe",
            "hub.verify_token": settings.META_VERIFY_TOKEN,
            "hub.challenge": "1158201244"
        }
        res = await ac.get("/api/v1/whatsapp/webhook", params=params)
        assert res.status_code == 200
        assert res.text == "1158201244"

@pytest.mark.asyncio
async def test_reject_invalid_hmac_signature():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        headers = {"X-Hub-Signature-256": "sha256=invalid_hash"}
        res = await ac.post("/api/v1/whatsapp/webhook", json={"entry": []}, headers=headers)
        assert res.status_code in [401, 403]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_webhook.py`
Expected: FAIL (404 Not Found)

- [ ] **Step 3: Implement HMAC verification and webhook router**

Write `backend/app/core/security.py`:
```python
import hmac
import hashlib

def verify_meta_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    signature = signature_header.split("sha256=")[1]
    expected_hash = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected_hash)
```

Write `backend/app/api/whatsapp.py`:
- Implement `GET` challenge handshake.
- Implement `POST` with raw request body signature check, immediate `200 OK`, and background queueing.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_webhook.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/core/security.py backend/app/api/whatsapp.py backend/tests/test_webhook.py
git commit -m "feat(backend): add secure WhatsApp Meta webhook endpoints"
```

---

### Task 6: Multimodal AI Engine & Function Calling

**Files:**
- Create: `backend/app/services/ai_tools.py`
- Create: `backend/app/services/ai_orchestrator.py`
- Test: `backend/tests/test_ai_engine.py`

**Interfaces:**
- Produces: `ai_orchestrator.process_incoming_message(customer_phone, message_text, media_url, media_type)`

- [ ] **Step 1: Write test for tool execution in mock AI environment**

```python
# backend/tests/test_ai_engine.py
import pytest
from app.services.ai_tools import execute_tool

@pytest.mark.asyncio
async def test_get_product_availability_tool(db_session):
    tool_args = {"keyword": "fer"}
    result = await execute_tool("get_product_availability", tool_args, db_session)
    assert "products" in result
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_ai_engine.py`
Expected: FAIL

- [ ] **Step 3: Implement tool functions and Gemini orchestration**

Write `backend/app/services/ai_tools.py`:
- `get_product_availability`
- `create_or_update_draft_order`
- `trigger_human_handover`

Write `backend/app/services/ai_orchestrator.py`:
- Connect Gemini 2.0 client.
- Register tools schema.
- Parse tool calls and execute deterministically.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_ai_engine.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/ai_tools.py backend/app/services/ai_orchestrator.py backend/tests/test_ai_engine.py
git commit -m "feat(backend): implement multimodal function calling orchestrator"
```

---

### Task 7: Receipt OCR & Duplicate Prevention Service

**Files:**
- Create: `backend/app/services/receipt_ocr_service.py`
- Test: `backend/tests/test_receipt_ocr.py`

**Interfaces:**
- Produces: `extract_receipt_data(image_url: str) -> dict`, `is_duplicate_receipt(transaction_ref: str) -> bool`

- [ ] **Step 1: Write test for OCR schema parsing and duplicate detection**

```python
# backend/tests/test_receipt_ocr.py
import pytest
from app.services.receipt_ocr_service import validate_receipt_uniqueness

@pytest.mark.asyncio
async def test_duplicate_receipt_blocking(db_session):
    ref = "WAVE-TX-998822"
    # First time: valid
    is_unique = await validate_receipt_uniqueness(ref, db_session)
    assert is_unique is True
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest backend/tests/test_receipt_ocr.py`
Expected: FAIL

- [ ] **Step 3: Implement OCR parsing and database uniqueness query**

Write `backend/app/services/receipt_ocr_service.py`:
- Use Gemini Vision to extract amount, date, transaction reference, operator.
- Query `Order.receipt_data->>'transaction_ref'` to ensure no duplicate entry exists.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest backend/tests/test_receipt_ocr.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/receipt_ocr_service.py backend/tests/test_receipt_ocr.py
git commit -m "feat(backend): add payment receipt OCR extraction and anti-fraud uniqueness check"
```

---

### Task 8: Frontend Scaffolding & Linear Design System Tokens

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/src/app/globals.css`
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`
- Create: `frontend/src/components/layout/Header.tsx`

**Interfaces:**
- Produces: Base responsive workbench layout with Linear tokens (#010102 background, #0f1011 surfaces, #23252a hairline borders, sidebar navigation).

- [ ] **Step 1: Setup Next.js 16 package.json and Tailwind configuration**

Write `frontend/package.json`:
```json
{
  "name": "omnisales-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.439.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^22.5.4",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.4.45",
    "tailwindcss": "^4.0.0"
  }
}
```

Write `frontend/src/app/globals.css`:
Define `:root` CSS variables with Linear design tokens:
- `--canvas: #010102`
- `--surface-1: #0f1011`
- `--surface-2: #141516`
- `--hairline: #23252a`
- `--ink: #f7f8f8`
- `--ink-muted: #8a8f98`
- `--primary: #5e6ad2`
- `--font-feature-tnum: 'tnum'`

- [ ] **Step 2: Create root layout, collapsible Sidebar, and Header**

Write `frontend/src/components/layout/Sidebar.tsx`:
- Links: Dashboard, Messagerie WhatsApp, Commandes, Catalogue & Stocks, Caisse & Paiements.
- System health indicators at bottom.

Write `frontend/src/app/layout.tsx`:
- Embed fonts and apply dark canvas background.

- [ ] **Step 3: Verify build with next build / lint**

Run: `npm run lint` or `npm run build`
Expected: Build passes without errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): scaffold Next.js 16 app with Linear design tokens"
```

---

### Task 9: API Client & TypeScript Domain Types

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/types.ts`
- Create: `frontend/src/lib/utils.ts`

**Interfaces:**
- Produces: Typed fetcher methods (`getProducts()`, `getOrders()`, `confirmOrder()`, `updateStock()`), FCFA currency formatter with tabular digits.

- [ ] **Step 1: Write TypeScript domain interfaces matching backend models**

Write `frontend/src/lib/types.ts`:
- `Product`, `Order`, `OrderLine`, `Customer`, `Conversation`, `Message`.

Write `frontend/src/lib/utils.ts`:
- `formatFCFA(amount: number) -> string` (formats e.g. "14 700 FCFA").

Write `frontend/src/lib/api.ts`:
- Reusable async client calling backend API with error handling.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/
git commit -m "feat(frontend): add typed API client and FCFA currency utility"
```

---

### Task 10: Cockpit Dashboard Overview Page

**Files:**
- Create: `frontend/src/app/page.tsx`
- Create: `frontend/src/components/dashboard/MetricCard.tsx`
- Create: `frontend/src/components/dashboard/PriorityOrdersTable.tsx`
- Create: `frontend/src/components/dashboard/InventoryAlertCard.tsx`

**Interfaces:**
- Produces: `/` Dashboard view with 4 KPI cards, priority action queue, and low stock warnings.

- [ ] **Step 1: Implement MetricCard with tabular numerals and subtle borders**

- [ ] **Step 2: Implement PriorityOrdersTable with inline 1-click confirmation**

- [ ] **Step 3: Implement Dashboard main page layout with live data fetching**

- [ ] **Step 4: Verify UI rendering**

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/page.tsx frontend/src/components/dashboard/
git commit -m "feat(frontend): implement Linear-style executive dashboard overview"
```

---

### Task 11: Live WhatsApp Inbox & Conversation Feed

**Files:**
- Create: `frontend/src/app/inbox/page.tsx`
- Create: `frontend/src/components/inbox/ConversationList.tsx`
- Create: `frontend/src/components/inbox/ChatTimeline.tsx`
- Create: `frontend/src/components/inbox/AudioVoicePlayer.tsx`
- Create: `frontend/src/components/inbox/CustomerProfileDrawer.tsx`

**Interfaces:**
- Produces: `/inbox` route with split-view chat, audio voice note player, customer drawer, and bot/human handover switch.

- [ ] **Step 1: Implement ConversationList with status indicators (Bot, Handover, Dispute)**

- [ ] **Step 2: Implement ChatTimeline and AudioVoicePlayer with waveform-like progress**

- [ ] **Step 3: Implement CustomerProfileDrawer with immediate Handover toggle**

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/inbox/ frontend/src/components/inbox/
git commit -m "feat(frontend): implement full-featured WhatsApp conversation cockpit"
```

---

### Task 12: Orders & Quotations Hub with 1-Click Validation

**Files:**
- Create: `frontend/src/app/orders/page.tsx`
- Create: `frontend/src/components/orders/OrderDataTable.tsx`
- Create: `frontend/src/components/orders/OrderDetailDrawer.tsx`

**Interfaces:**
- Produces: `/orders` route with searchable table, status filter pills, sliding detail drawer, and `Ctrl+Enter` shortcut to validate.

- [ ] **Step 1: Implement OrderDataTable with dense Linear rows and Stripe status pills**

- [ ] **Step 2: Implement OrderDetailDrawer with order lines, subtotal breakdown, and confirmation CTA**

- [ ] **Step 3: Bind keyboard shortcut `Ctrl+Enter` to order confirmation**

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/orders/ frontend/src/components/orders/
git commit -m "feat(frontend): implement high-density orders hub with 1-click validation"
```

---

### Task 13: Inventory & Stock Management

**Files:**
- Create: `frontend/src/app/inventory/page.tsx`
- Create: `frontend/src/components/inventory/ProductTable.tsx`
- Create: `frontend/src/components/inventory/QuickStockEditModal.tsx`

**Interfaces:**
- Produces: `/inventory` route with real-time stock indicator and inline stock quantity editor.

- [ ] **Step 1: Implement ProductTable with SKU search and critical stock highlights**

- [ ] **Step 2: Implement QuickStockEditModal with instant PATCH API call**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/inventory/ frontend/src/components/inventory/
git commit -m "feat(frontend): implement inventory and stock management module"
```

---

### Task 14: Payment Verification & Cashdesk

**Files:**
- Create: `frontend/src/app/cashdesk/page.tsx`
- Create: `frontend/src/components/cashdesk/ReceiptLightbox.tsx`
- Create: `frontend/src/components/cashdesk/OCRComparisonCard.tsx`

**Interfaces:**
- Produces: `/cashdesk` route with side-by-side view of receipt capture and extracted OCR data for cashier validation.

- [ ] **Step 1: Implement ReceiptLightbox to preview Mobile Money transfer screenshots**

- [ ] **Step 2: Implement OCRComparisonCard displaying transaction ref, amount, date, and validation button**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/cashdesk/ frontend/src/components/cashdesk/
git commit -m "feat(frontend): implement cashdesk receipt inspection and approval interface"
```

---

### Task 15: Unified Docker Compose & Integration Verification

**Files:**
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docker-compose.yml`
- Create: `backend/tests/test_e2e_flow.py`

**Interfaces:**
- Produces: One-command `docker compose up` spinning up PostgreSQL 18, FastAPI, and Next.js 16.

- [ ] **Step 1: Write backend Dockerfile (Python 3.12-slim)**

- [ ] **Step 2: Write frontend Dockerfile (Node 20-alpine)**

- [ ] **Step 3: Write docker-compose.yml with network bridges and healthcheck dependencies**

- [ ] **Step 4: Run end-to-end integration test simulating incoming quote -> receipt -> confirmation**

Run: `pytest backend/tests/test_e2e_flow.py`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml backend/tests/test_e2e_flow.py
git commit -m "feat(deploy): add unified Docker Compose and end-to-end flow test"
```
