from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserRole
from app.schemas import (
    UserResponse,
    UserCreate,
    UserUpdate,
)
from app.dependencies import (
    get_current_user,
    PermissionChecker,
    can_view_user,
    can_manage_user,
    can_create_role,
    can_assign_role,
)
from app.auth_utils import hash_password


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# List users
@router.get(
    "",
    response_model=List[UserResponse],
    dependencies=[
        Depends(PermissionChecker("users:read"))
    ],
)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin can see everyone
    if current_user.role == UserRole.ADMIN:
        result = await db.execute(
            select(User)
            .offset(skip)
            .limit(limit)
        )

        return result.scalars().all()

    # Manager can see Editor and Viewer
    if current_user.role == UserRole.MANAGER:
        result = await db.execute(
            select(User)
            .where(
                User.role.in_(
                    [
                        UserRole.EDITOR,
                        UserRole.VIEWER,
                    ]
                )
            )
            .offset(skip)
            .limit(limit)
        )

        return result.scalars().all()

    # Editor can see Viewer
    if current_user.role == UserRole.EDITOR:
        result = await db.execute(
            select(User)
            .where(
                User.role == UserRole.VIEWER
            )
            .offset(skip)
            .limit(limit)
        )

        return result.scalars().all()

    # Viewer can see themselves
    result = await db.execute(
        select(User).where(
            User.id == current_user.id
        )
    )

    return result.scalars().all()


# Create user
@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(PermissionChecker("users:create"))
    ],
)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check allowed role
    if not can_create_role(
        current_user,
        data.role,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"{current_user.role.value} "
                f"cannot create {data.role.value} users"
            ),
        )

    # Check duplicate email
    result = await db.execute(
        select(User).where(
            User.email == data.email
        )
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        role=data.role,
        is_active=data.is_active,
    )

    db.add(user)

    await db.commit()

    await db.refresh(user)

    return user


# Get single user
@router.get(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[
        Depends(PermissionChecker("users:read"))
    ],
)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find user
    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check visibility
    if not can_view_user(
        current_user,
        user,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this user",
        )

    return user


# Update user
@router.put(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[
        Depends(PermissionChecker("users:update"))
    ],
)
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find user
    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check management access
    if not can_manage_user(
        current_user,
        user,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to update this user",
        )

    # Check role change
    if data.role is not None:
        if not can_assign_role(
            current_user,
            data.role,
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to assign this role",
            )

    # Get update fields
    update_data = data.model_dump(
        exclude_unset=True
    )

    # Hash password if provided
    if "password" in update_data:
        password = update_data.pop("password")

        if password:
            update_data["hashed_password"] = hash_password(
                password
            )

    # Apply updates
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()

    await db.refresh(user)

    return user


# Delete user
@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(PermissionChecker("users:delete"))
    ],
)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only Admin can delete
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users",
        )

    # Find user
    result = await db.execute(
        select(User).where(
            User.id == user_id
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Admin cannot delete themselves
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself",
        )

    # Delete user
    await db.delete(user)

    await db.commit()

    return None