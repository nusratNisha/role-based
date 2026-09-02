import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine, Base
from app.models import User, UserRole
from app.auth_utils import hash_password


async def init_database():
    """Create tables and seed admin user."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if admin exists
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        if not result.scalar_one_or_none():
            admin = User(
                email="admin@example.com",
                hashed_password=hash_password("admin12345"),
                first_name="Admin",
                last_name="User",
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            print("✅ Admin created: admin@example.com / admin12345")
        else:
            print("ℹ️ Admin already exists")

        # Seed some demo users
        demo_users = [
            ("manager@example.com", "Manager", "Jane", UserRole.MANAGER),
            ("editor@example.com", "Editor", "Bob", UserRole.EDITOR),
            ("viewer@example.com", "Viewer", "Alice", UserRole.VIEWER),
        ]

        for email, last, first, role in demo_users:
            result = await db.execute(select(User).where(User.email == email))
            if not result.scalar_one_or_none():
                user = User(
                    email=email,
                    hashed_password=hash_password("password123"),
                    first_name=first,
                    last_name=last,
                    role=role,
                    is_active=True,
                )
                db.add(user)
        
        await db.commit()
        print("✅ Database initialized with seed data")


if __name__ == "__main__":
    asyncio.run(init_database())