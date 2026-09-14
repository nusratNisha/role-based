import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List 
from app.routers import auth, users, dashboard, projects

app = FastAPI(
    title="RBAC Dashboard API",
    description="Role-Based Access Control Management API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)

@app.get(f"{API_PREFIX}/health")
async def health():
    return {
        "status": "healthy",
        "service": "RBAC Dashboard API",
    }
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)