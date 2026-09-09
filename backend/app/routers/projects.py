from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Project, User, UserRole
from app.dependencies import PermissionChecker, get_current_user
from app.schemas import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["Projects"])


def can_manage_project(current_user: User, project: Project) -> bool:
    if current_user.role in {UserRole.ADMIN, UserRole.MANAGER}:
        return True
    return current_user.role == UserRole.EDITOR


async def get_project_or_404(project_id: str, db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


async def ensure_assignee_exists(assigned_to_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == assigned_to_id, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user does not exist or is inactive",
        )
    return user


@router.get(
    "",
    response_model=List[ProjectResponse],
    dependencies=[Depends(PermissionChecker("projects:read"))],
)
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Project).offset(skip).limit(limit)
    if current_user.role == UserRole.VIEWER:
        query = query.where(Project.assigned_to_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker("projects:create"))],
)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.EDITOR and data.assigned_to_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editors may only create projects assigned to themselves",
        )
    await ensure_assignee_exists(data.assigned_to_id, db)
    project = Project(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    dependencies=[Depends(PermissionChecker("projects:read"))],
)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await get_project_or_404(project_id, db)
    if current_user.role == UserRole.VIEWER and project.assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not allowed to view this project")
    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    dependencies=[Depends(PermissionChecker("projects:update"))],
)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await get_project_or_404(project_id, db)
    if not can_manage_project(current_user, project):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not allowed to update this project")

    update_data = data.model_dump(exclude_unset=True)
    assigned_to_id = update_data.get("assigned_to_id")
    if current_user.role == UserRole.EDITOR and assigned_to_id is not None and assigned_to_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Editors may not reassign projects")
    if assigned_to_id is not None:
        await ensure_assignee_exists(assigned_to_id, db)
    for field, value in update_data.items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(PermissionChecker("projects:delete"))],
)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await get_project_or_404(project_id, db)
    if current_user.role not in {UserRole.ADMIN, UserRole.MANAGER}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins and managers can delete projects")
    await db.delete(project)
    await db.commit()
    return None
