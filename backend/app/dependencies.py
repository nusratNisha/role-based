from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.auth_utils import get_token_from_cookie, decode_token
from app.models import User, UserRole
from app.schemas import TokenPayload


# ─── Current User ───
async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token = get_token_from_cookie(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload: TokenPayload | None = decode_token(token)
    if not payload or not payload.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user


# ─── Role Hierarchy ───
ROLE_HIERARCHY = {
    UserRole.ADMIN: 4,
    UserRole.MANAGER: 3,
    UserRole.EDITOR: 2,
    UserRole.VIEWER: 1,
}

ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "users:read", "users:create", "users:update", "users:delete",
        "settings:read", "settings:update", "dashboard:read",
    ],
    UserRole.MANAGER: [
        "users:read", "users:create", "users:update",
        "settings:read", "dashboard:read",
    ],
    UserRole.EDITOR: [
        "users:read", "users:update", "dashboard:read",
    ],
    UserRole.VIEWER: [
        "users:read", "dashboard:read",
    ],
}


def has_permission(role: UserRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, [])


def has_role(user_role: UserRole, required_role: UserRole) -> bool:
    return ROLE_HIERARCHY.get(user_role, 0) >= ROLE_HIERARCHY.get(required_role, 0)


# ─── Permission Checker Dependency ───
class PermissionChecker:
    def __init__(self, permission: str):
        self.permission = permission

    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if not has_permission(current_user.role, self.permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{self.permission}' required",
            )
        return current_user


# ─── Role Checker Dependency ───
class RoleChecker:
    def __init__(self, required_role: UserRole):
        self.required_role = required_role

    async def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if not has_role(current_user.role, self.required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{self.required_role.value}' or higher required",
            )
        return current_user


# ─── Convenience exports ───
RequireAdmin = RoleChecker(UserRole.ADMIN)
RequireManager = RoleChecker(UserRole.MANAGER)
RequireEditor = RoleChecker(UserRole.EDITOR)