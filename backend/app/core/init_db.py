import asyncio
from app.core.database import engine, Base
import app.models.entities  # noqa: F401

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("PostgreSQL tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
