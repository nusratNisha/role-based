from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, UserRole
from app.schemas import DashboardStats
from app.dependencies import PermissionChecker

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats, dependencies=[Depends(PermissionChecker("dashboard:read"))])
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Total users
    total_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_result.scalar()

    # Active users
    active_result = await db.execute(select(func.count()).select_from(User).where(User.is_active == True))
    active_users = active_result.scalar()

    # New this month
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_result = await db.execute(
        select(func.count()).select_from(User).where(User.created_at >= month_start)
    )
    new_users = new_result.scalar()

    # Role distribution
    role_dist = {}
    for role in UserRole:
        r = await db.execute(select(func.count()).select_from(User).where(User.role == role))
        role_dist[role.value] = r.scalar()

    # Monthly growth (last 6 months)
    monthly_growth = []
    for i in range(5, -1, -1):
        d = now - timedelta(days=30 * i)
        month_label = d.strftime("%b")
        # Simplified: count users created before end of that month
        month_end = (d.replace(day=1) + timedelta(days=32)).replace(day=1)
        r = await db.execute(
            select(func.count()).select_from(User).where(User.created_at < month_end)
        )
        monthly_growth.append({"month": month_label, "users": r.scalar()})

    # Recent activity (mocked - in production use an ActivityLog table)
    recent_activity = [
        {"id": "1", "action": "System initialized", "user": "System", "timestamp": now.isoformat()},
    ]

    return DashboardStats(
        total_users=total_users or 0,
        active_users=active_users or 0,
        new_users_this_month=new_users or 0,
        role_distribution=role_dist,
        monthly_growth=monthly_growth,
        recent_activity=recent_activity,
    )