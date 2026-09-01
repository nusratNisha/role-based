from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, users, dashboard

settings = get_settings()

app = FastAPI(
    title="RBAC Dashboard API",
    description="Role-Based Access Control Management API",
    version="1.0.0",
)

# CORS - critical for cookies to work cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}