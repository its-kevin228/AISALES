import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from app.core.database import engine, Base, AsyncSessionLocal
import app.models.entities as models

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("PostgreSQL tables created or verified successfully.")

    # Seed initial demo data if database is empty
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(models.Product))
        existing_product = result.scalars().first()
        if not existing_product:
            print("Seeding initial Omnisales AI demo catalog, customers and sample orders...")

            # 1. Products
            p1 = models.Product(
                id=uuid.uuid4(),
                code="CAR-6060",
                name="Carreaux Grès Cérame 60x60 Poli",
                category="Carrelage",
                unit_price=9500,
                stock_quantity=85,
                is_active=True
            )
            p2 = models.Product(
                id=uuid.uuid4(),
                code="COL-25KG",
                name="Colle Carrelage Haute Performance 25kg",
                category="Colles & Mortiers",
                unit_price=4500,
                stock_quantity=40,
                is_active=True
            )
            p3 = models.Product(
                id=uuid.uuid4(),
                code="FER-12MM",
                name="Fer à Béton Haute Adhérence FeE500 Ø12",
                category="Gros Œuvre",
                unit_price=7200,
                stock_quantity=120,
                is_active=True
            )
            p4 = models.Product(
                id=uuid.uuid4(),
                code="CIM-50KG",
                name="Ciment CPJ 42.5 Haute Résistance Sac 50kg",
                category="Gros Œuvre",
                unit_price=5000,
                stock_quantity=12,  # Low stock alert
                is_active=True
            )
            p5 = models.Product(
                id=uuid.uuid4(),
                code="PEINT-BLANC-20L",
                name="Peinture Façade Hydrofuge Blanc 20L",
                category="Finitions",
                unit_price=28000,
                stock_quantity=8,  # Low stock alert
                is_active=True
            )
            session.add_all([p1, p2, p3, p4, p5])
            await session.flush()

            # 2. Customers
            c1 = models.Customer(
                id=uuid.uuid4(),
                phone_number="+2250708091011",
                name="M. Kouamé (Chantier Cocody)",
                address="Cocody Riviera 4, Abidjan"
            )
            c2 = models.Customer(
                id=uuid.uuid4(),
                phone_number="+2250102030405",
                name="Quincaillerie Moderne",
                address="Marcory Zone 4, Abidjan"
            )
            c3 = models.Customer(
                id=uuid.uuid4(),
                phone_number="+2250512345678",
                name="Entreprise BTP Bamba",
                address="Yopougon Zone Industrielle, Abidjan"
            )
            session.add_all([c1, c2, c3])
            await session.flush()

            # 3. Orders
            # Order 1: Pending validation with Mobile Money receipt
            o1 = models.Order(
                id=uuid.uuid4(),
                order_number="CMD-2026-001",
                customer_id=c1.id,
                status="pending_validation",
                total_amount=156000,
                receipt_url="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
                receipt_data={
                    "operator": "Wave",
                    "transaction_ref": "WAVE-TX-984214",
                    "amount": 156000,
                    "sender_phone": "+2250708091011",
                    "timestamp": "2026-09-16 09:12:00"
                }
            )
            ol1 = models.OrderLine(
                id=uuid.uuid4(),
                order_id=o1.id,
                product_id=p1.id,
                quantity=15,
                unit_price=9500,
                subtotal=142500
            )
            ol2 = models.OrderLine(
                id=uuid.uuid4(),
                order_id=o1.id,
                product_id=p2.id,
                quantity=3,
                unit_price=4500,
                subtotal=13500
            )

            # Order 2: Confirmed order
            o2 = models.Order(
                id=uuid.uuid4(),
                order_number="CMD-2026-002",
                customer_id=c2.id,
                status="confirmed",
                total_amount=360000,
                receipt_url="https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800",
                receipt_data={
                    "operator": "Orange Money",
                    "transaction_ref": "OM-CI-489102",
                    "amount": 360000,
                    "sender_phone": "+2250102030405",
                    "timestamp": "2026-09-15 16:45:00"
                }
            )
            ol3 = models.OrderLine(
                id=uuid.uuid4(),
                order_id=o2.id,
                product_id=p3.id,
                quantity=50,
                unit_price=7200,
                subtotal=360000
            )

            # Order 3: Draft proforma
            o3 = models.Order(
                id=uuid.uuid4(),
                order_number="CMD-2026-003",
                customer_id=c3.id,
                status="draft",
                total_amount=72000
            )
            ol4 = models.OrderLine(
                id=uuid.uuid4(),
                order_id=o3.id,
                product_id=p3.id,
                quantity=10,
                unit_price=7200,
                subtotal=72000
            )

            session.add_all([o1, ol1, ol2, o2, ol3, o3, ol4])

            # 4. Conversations & Messages
            conv1 = models.Conversation(
                id=uuid.uuid4(),
                customer_id=c1.id,
                status="bot",
                last_activity_at=datetime.now(timezone.utc).replace(tzinfo=None)
            )
            session.add(conv1)
            await session.flush()

            m1 = models.Message(
                id=uuid.uuid4(),
                conversation_id=conv1.id,
                direction="inbound",
                sender="customer",
                content="Salut ! Il vous reste 15 cartons de carreaux 60x60 et 3 sacs de colle ?",
                media_type="text"
            )
            m2 = models.Message(
                id=uuid.uuid4(),
                conversation_id=conv1.id,
                direction="outbound",
                sender="ai_agent",
                content="Bonjour M. Kouamé ! Oui, les carreaux 60x60 sont bien disponibles en stock (85 cartons restants à 9 500 FCFA le carton) et la colle carrelage 25kg est à 4 500 FCFA le sac. Le montant total s'élève à 156 000 FCFA.",
                media_type="text"
            )
            m3 = models.Message(
                id=uuid.uuid4(),
                conversation_id=conv1.id,
                direction="inbound",
                sender="customer",
                content="Parfait, je vous ai fait le virement Wave de 156 000 FCFA. Voici la preuve.",
                media_type="image",
                media_url="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800"
            )
            session.add_all([m1, m2, m3])

            await session.commit()
            print("Omnisales demo data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
