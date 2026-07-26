"""
Users Endpoints
"""

import logging
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.models.user import UserCreate, UserUpdate, UserResponse
from app.models.api_key import ApiKeyCreate, ApiKeyUpdate, ApiKeyResponse, ApiKeyWithSecretResponse
from app.services.user import (
    create_user,
    get_user_by_id,
    update_user,
    delete_user,
    create_api_key,
    get_user_api_keys,
    update_api_key,
    delete_api_key,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/users")


@router.post("/", response_model=UserResponse)
async def create_new_user(user_data: UserCreate):
    """Create a new user"""
    try:
        user = await create_user(user_data)
        logger.info(f"Created new user: {user.id}")
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Annotated[UserResponse, Depends(get_current_active_user)]):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    """Update current user profile"""
    try:
        updated_user = await update_user(current_user.id, user_data)
        logger.info(f"Updated user profile: {current_user.id}")
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/me")
async def delete_me(current_user: Annotated[UserResponse, Depends(get_current_active_user)]):
    """Delete current user account"""
    try:
        await delete_user(current_user.id)
        logger.info(f"Deleted user account: {current_user.id}")
        return {"message": "User account deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# API Keys Endpoints

@router.post("/api-keys", response_model=ApiKeyWithSecretResponse)
async def create_new_api_key(
    api_key_data: ApiKeyCreate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    """Create a new API key"""
    try:
        api_key = await create_api_key(current_user.id, api_key_data)
        logger.info(f"Created new API key for user {current_user.id}")
        return api_key
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def get_my_api_keys(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    """Get all API keys for current user"""
    api_keys = await get_user_api_keys(current_user.id)
    return api_keys


@router.put("/api-keys/{api_key_id}", response_model=ApiKeyResponse)
async def update_my_api_key(
    api_key_id: str,
    api_key_data: ApiKeyUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    """Update an API key"""
    try:
        updated_key = await update_api_key(api_key_id, current_user.id, api_key_data)
        logger.info(f"Updated API key {api_key_id} for user {current_user.id}")
        return updated_key
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/api-keys/{api_key_id}")
async def delete_my_api_key(
    api_key_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)]
):
    """Delete an API key"""
    try:
        await delete_api_key(api_key_id, current_user.id)
        logger.info(f"Deleted API key {api_key_id} for user {current_user.id}")
        return {"message": "API key deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
