"""
Models Module (Pydantic Schemas)
"""

from app.models.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
)
from app.models.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractListResponse,
    ContractUploadResponse,
)
from app.models.analysis import (
    ContractAnalysisResponse,
    AnalysisRequest,
)
from app.models.subscription import (
    SubscriptionResponse,
    PlanResponse,
)
from app.models.folder import (
    FolderCreate,
    FolderUpdate,
    FolderResponse,
)
from app.models.tag import (
    TagCreate,
    TagUpdate,
    TagResponse,
)
from app.models.api_key import (
    ApiKeyCreate,
    ApiKeyUpdate,
    ApiKeyResponse,
)

__all__ = [
    # User models
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLogin",
    "TokenResponse",
    "RefreshTokenRequest",
    # Contract models
    "ContractCreate",
    "ContractUpdate",
    "ContractResponse",
    "ContractListResponse",
    "ContractUploadResponse",
    # Analysis models
    "ContractAnalysisResponse",
    "AnalysisRequest",
    # Subscription models
    "SubscriptionResponse",
    "PlanResponse",
    # Folder models
    "FolderCreate",
    "FolderUpdate",
    "FolderResponse",
    # Tag models
    "TagCreate",
    "TagUpdate",
    "TagResponse",
    # API Key models
    "ApiKeyCreate",
    "ApiKeyUpdate",
    "ApiKeyResponse",
]
