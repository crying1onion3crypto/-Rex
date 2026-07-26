"""
Settings Endpoints
"""

import logging
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.models.user import UserResponse
from app.models.api_key import ApiKeyCreate, ApiKeyUpdate, ApiKeyResponse, ApiKeyWithSecretResponse
from app.services.user import (
    create_api_key,
    get_user_api_keys,
    update_api_key,
    delete_api_key,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/settings")


@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def list_api_keys(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """List all API keys for the current user"""
    try:
        api_keys = await get_user_api_keys(current_user.id)
        return api_keys
    except Exception as e:
        logger.error(f"Failed to list API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list API keys",
        )


@router.post("/api-keys", response_model=ApiKeyWithSecretResponse)
async def create_api_key_endpoint(
    api_key_data: ApiKeyCreate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create a new API key"""
    try:
        api_key = await create_api_key(current_user.id, api_key_data)
        return api_key
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to create API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create API key",
        )


@router.put("/api-keys/{api_key_id}", response_model=ApiKeyResponse)
async def update_api_key_endpoint(
    api_key_id: str,
    api_key_data: ApiKeyUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Update an API key"""
    try:
        updated_key = await update_api_key(api_key_id, current_user.id, api_key_data)
        return updated_key
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to update API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update API key",
        )


@router.delete("/api-keys/{api_key_id}")
async def delete_api_key_endpoint(
    api_key_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Delete an API key"""
    try:
        await delete_api_key(api_key_id, current_user.id)
        return {"message": "API key deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to delete API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete API key",
        )


@router.get("/profile")
async def get_profile_settings(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get user profile settings"""
    try:
        return {
            "user": current_user,
            "preferences": {
                "theme": "dark",  # Default theme
                "language": "en",
                "notifications": True,
            }
        }
    except Exception as e:
        logger.error(f"Failed to get profile settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get profile settings",
        )
