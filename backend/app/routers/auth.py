from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.db.models import User
from app.schemas import LoginRequest, UserCreate, UserResponse
from app.auth_utils import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    set_auth_cookie,
    set_refresh_cookie,
    delete_auth_cookie,
    delete_refresh_cookie,
    decode_token,
    get_refresh_token_from_cookie,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=None, status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

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

    access_token = create_access_token(str(user.id), user.role.value)
    refresh_token = create_refresh_token(str(user.id))
    set_auth_cookie(response, access_token)
    set_refresh_cookie(response, refresh_token)

    from app.schemas import AuthResponse
    return AuthResponse(user=user, token=access_token)


@router.post("/login")
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token(str(user.id), user.role.value)
    refresh_token = create_refresh_token(str(user.id))
    set_auth_cookie(response, access_token)
    set_refresh_cookie(response, refresh_token)

    from app.schemas import AuthResponse
    return AuthResponse(user=user, token=access_token)


@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    refresh_token_value = get_refresh_token_from_cookie(request)
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    payload = decode_token(refresh_token_value)
    if not payload or payload.type != "refresh" or not payload.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    result = await db.execute(select(User).where(User.id == payload.sub))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user",
        )

    access_token = create_access_token(str(user.id), user.role.value)
    set_auth_cookie(response, access_token)
    return {"token": access_token}


@router.post("/logout")
async def logout(response: Response):
    delete_auth_cookie(response)
    delete_refresh_cookie(response)
    return {"message": "Logout successful"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/validate", response_model=UserResponse)
async def validate_token(current_user: User = Depends(get_current_user)):
    return current_user
