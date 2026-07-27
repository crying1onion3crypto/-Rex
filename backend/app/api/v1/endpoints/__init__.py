"""
Endpoints Module
"""

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.contracts import router as contracts_router
from app.api.v1.endpoints.analysis import router as analysis_router
from app.api.v1.endpoints.subscription import router as subscription_router
from app.api.v1.endpoints.folders import router as folders_router
from app.api.v1.endpoints.tags import router as tags_router
from app.api.v1.endpoints.settings import router as settings_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.stripe import router as stripe_router

__all__ = [
    "auth_router",
    "users_router",
    "contracts_router",
    "analysis_router",
    "subscription_router",
    "folders_router",
    "tags_router",
    "settings_router",
    "dashboard_router",
    "stripe_router",
]
