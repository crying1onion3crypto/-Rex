"""
API v1 Module
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth_router,
    users_router,
    contracts_router,
    analysis_router,
    subscription_router,
    folders_router,
    tags_router,
    settings_router,
    dashboard_router,
)

# Create API router
api_router = APIRouter(prefix="/v1")

# Include endpoint routers
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(contracts_router, prefix="/contracts", tags=["Contracts"])
api_router.include_router(analysis_router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(subscription_router, prefix="/subscription", tags=["Subscription"])
api_router.include_router(folders_router, prefix="/folders", tags=["Folders"])
api_router.include_router(tags_router, prefix="/tags", tags=["Tags"])
api_router.include_router(settings_router, prefix="/settings", tags=["Settings"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
