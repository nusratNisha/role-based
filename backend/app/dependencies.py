from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.auth_utils import get_token_from_cookie, decode_token
from app.db.models import User, UserRole
from app.schemas import TokenPayload


# Get authenticated user
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

    result = await db.execute(
        select(User).where(User.id == payload.sub)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    return user


# Role hierarchy
ROLE_HIERARCHY = {
    UserRole.ADMIN: 4,
    UserRole.MANAGER: 3,
    UserRole.EDITOR: 2,
    UserRole.VIEWER: 1,
}


def get_role_level(role: UserRole) -> int:
    return ROLE_HIERARCHY.get(role, 0)


def has_role(
    user_role: UserRole,
    required_role: UserRole,
) -> bool:
    return (
        get_role_level(user_role)
        >= get_role_level(required_role)
    )


# Role permissions
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "users:read",
        "users:create",
        "users:update",
        "users:delete",
        "settings:read",
        "settings:update",
        "dashboard:read",
        "projects:read",
        "projects:create",
        "projects:update",
        "projects:delete",
    ],
    UserRole.MANAGER: [
        "users:read",
        "users:create",
        "users:update",
        "settings:read",
        "dashboard:read",
        "projects:read",
        "projects:create",
        "projects:update",
        "projects:delete",
    ],
    UserRole.EDITOR: [
        "users:read",
        "users:create",
        "users:update",
        "dashboard:read",
        "projects:read",
        "projects:create",
        "projects:update",
    ],
    UserRole.VIEWER: [
        "users:read",
        "dashboard:read",
        "projects:read",
    ],
}


def has_permission(
    role: UserRole,
    permission: str,
) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, [])


# User visibility
def can_view_user(
    current_user: User,
    target_user: User,
) -> bool:

    if current_user.role == UserRole.ADMIN:
        return True

    if current_user.role == UserRole.VIEWER:
        return current_user.id == target_user.id

    if target_user.role == UserRole.ADMIN:
        return False

    if current_user.role == UserRole.MANAGER:
        return target_user.role in {
            UserRole.EDITOR,
            UserRole.VIEWER,
        }

    if current_user.role == UserRole.EDITOR:
        return target_user.role == UserRole.VIEWER

    return False


# User management
def can_manage_user(
    current_user: User,
    target_user: User,
) -> bool:

    if current_user.role == UserRole.ADMIN:
        return True

    if current_user.role == UserRole.VIEWER:
        return False

    if target_user.role == UserRole.ADMIN:
        return False

    if current_user.role == UserRole.MANAGER:
        return target_user.role in {
            UserRole.MANAGER,
            UserRole.EDITOR,
            UserRole.VIEWER,
        }

    if current_user.role == UserRole.EDITOR:
        return target_user.role in {
            UserRole.EDITOR,
            UserRole.VIEWER,
        }

    return False


# Allowed roles for creating users
ALLOWED_CREATION_ROLES = {
    UserRole.ADMIN: {
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.EDITOR,
        UserRole.VIEWER,
    },
    UserRole.MANAGER: {
        UserRole.MANAGER,
        UserRole.EDITOR,
        UserRole.VIEWER,
    },
    UserRole.EDITOR: {
        UserRole.EDITOR,
        UserRole.VIEWER,
    },
    UserRole.VIEWER: set(),
}


def can_create_role(
    current_user: User,
    new_role: UserRole,
) -> bool:
    allowed_roles = ALLOWED_CREATION_ROLES.get(
        current_user.role,
        set(),
    )

    return new_role in allowed_roles


# Allowed roles for changing user roles
ALLOWED_ASSIGNMENT_ROLES = {
    UserRole.ADMIN: {
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.EDITOR,
        UserRole.VIEWER,
    },
    UserRole.MANAGER: {
        UserRole.MANAGER,
        UserRole.EDITOR,
        UserRole.VIEWER,
    },
    UserRole.EDITOR: {
        UserRole.EDITOR,
        UserRole.VIEWER,
    },
    UserRole.VIEWER: set(),
}


def can_assign_role(
    current_user: User,
    new_role: UserRole,
) -> bool:
    allowed_roles = ALLOWED_ASSIGNMENT_ROLES.get(
        current_user.role,
        set(),
    )

    return new_role in allowed_roles


# Permission checker
class PermissionChecker:

    def __init__(self, permission: str):
        self.permission = permission

    async def __call__(
        self,
        current_user: User = Depends(get_current_user),
    ) -> User:

        if not has_permission(
            current_user.role,
            self.permission,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{self.permission}' required",
            )

        return current_user


# Role checker
class RoleChecker:

    def __init__(self, required_role: UserRole):
        self.required_role = required_role

    async def __call__(
        self,
        current_user: User = Depends(get_current_user),
    ) -> User:

        if not has_role(
            current_user.role,
            self.required_role,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role '{self.required_role.value}' "
                    "or higher required"
                ),
            )

        return current_user


# Convenience dependencies
RequireAdmin = RoleChecker(UserRole.ADMIN)
RequireManager = RoleChecker(UserRole.MANAGER)
RequireEditor = RoleChecker(UserRole.EDITOR)