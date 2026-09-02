from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.models import UserRole


# ─── Shared ───
class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.VIEWER
    is_active: bool = True


# ─── Create ───
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserCreateInternal(UserBase):
    hashed_password: str


# ─── Update ───
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


# ─── Response ───
class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


# ─── Auth ───
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPayload(BaseModel):
    sub: str  # user id
    role: str
    exp: Optional[datetime] = None


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


# ─── Dashboard ───
class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    new_users_this_month: int
    role_distribution: dict
    monthly_growth: list[dict]
    recent_activity: list[dict]