from pydantic import (BaseModel, EmailStr, Field,
    ConfigDict, model_validator,)
from datetime import datetime
from typing import Optional

from app.db.models import ProjectStatus, UserRole
from pydantic.alias_generators import to_camel


# ─────────────────────────────────────────
# Shared User
# ─────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.VIEWER
    is_active: bool = True


# ─────────────────────────────────────────
# Register
# ─────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )

    confirm_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )

    @model_validator(mode="after")
    def validate_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")

        return self


# ─────────────────────────────────────────
# Internal User Creation
# ─────────────────────────────────────────

class UserCreateInternal(UserBase):
    hashed_password: str


# ─────────────────────────────────────────
# Update User
# ─────────────────────────────────────────

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None

    first_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
    )

    last_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
    )

    role: Optional[UserRole] = None

    is_active: Optional[bool] = None


# ─────────────────────────────────────────
# User Response
# ─────────────────────────────────────────

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: Optional[str] = None
    email: EmailStr

    role: UserRole
    status: Optional[str] = None
    auth_provider: Optional[str] = None

    is_active: bool
    must_change_password: bool

    hris_id: Optional[str] = None
    facility_id: Optional[str] = None
    lab_id: Optional[str] = None
    mobile: Optional[str] = None

    first_name: str
    last_name: str

    division_id: Optional[str] = None
    district_id: Optional[str] = None
    upazila_id: Optional[str] = None
    union_id: Optional[str] = None

    created_at: datetime
    updated_at: datetime


# ─────────────────────────────────────────
# Projects
# ─────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
    )

    description: Optional[str] = Field(
        None,
        max_length=2000,
    )

    status: ProjectStatus = ProjectStatus.PLANNING

    assigned_to_id: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
    )

    description: Optional[str] = Field(
        None,
        max_length=2000,
    )

    status: Optional[ProjectStatus] = None

    assigned_to_id: Optional[str] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str]
    status: ProjectStatus
    assigned_to_id: str
    created_at: datetime
    updated_at: datetime


# ─────────────────────────────────────────
# Authentication
# ─────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPayload(BaseModel):
    sub: str
    role: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[datetime] = None


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


# ─────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────

class DashboardStats(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    total_users: int
    active_users: int
    new_users_this_month: int
    role_distribution: dict
    monthly_growth: list[dict]
    recent_activity: list[dict]

