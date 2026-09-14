import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, ForeignKey, func, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EDITOR = "editor"
    VIEWER = "viewer"


class ProjectStatus(str, enum.Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class User(Base):
    __tablename__ = "users"

    # -------------------------
    # Primary key
    # -------------------------
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # -------------------------
    # Authentication
    # -------------------------
    username: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # -------------------------
    # User information
    # -------------------------
    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    mobile: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    # -------------------------
    # RBAC
    # -------------------------
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        default=UserRole.VIEWER,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # -------------------------
    # Account status
    # -------------------------
    status: Mapped[str | None] = mapped_column(
        String(50),
        default="active",
        nullable=True,
    )

    auth_provider: Mapped[str | None] = mapped_column(
        String(50),
        default="local",
        nullable=True,
    )

    must_change_password: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # -------------------------
    # HR / organization
    # -------------------------
    hris_id: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
    )

    facility_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    lab_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    division_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    district_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    upazila_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    union_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # -------------------------
    # Timestamps
    # -------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(2000),
        nullable=True,
    )

    status: Mapped[ProjectStatus] = mapped_column(
        SQLEnum(ProjectStatus),
        default=ProjectStatus.PLANNING,
        nullable=False,
    )

    assigned_to_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
