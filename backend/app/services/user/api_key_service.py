"""
API Key Service Implementation
"""

import logging
import secrets
from typing import Optional, List

from prisma.models import ApiKey as PrismaApiKey

from app.core.dependencies.database import get_db
from app.models.api_key import ApiKeyCreate, ApiKeyUpdate, ApiKeyResponse, ApiKeyWithSecretResponse
from app.models.user import UserResponse

logger = logging.getLogger(__name__)


async def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"sk-{secrets.token_urlsafe(48)}"


async def create_api_key(user_id: str, api_key_data: ApiKeyCreate) -> ApiKeyWithSecretResponse:
    """Create a new API key for a user"""
    db = await get_db()
    
    # Generate key if not provided
    key = api_key_data.key or await generate_api_key()
    
    # Create API key
    api_key = await db.apikey.create(
        data={
            "userId": user_id,
            "name": api_key_data.name,
            "key": key,
            "provider": api_key_data.provider.value,
            "isActive": True,
        }
    )
    
    logger.info(f"Created new API key for user {user_id}: {api_key.id}")
    
    return ApiKeyWithSecretResponse(
        id=api_key.id,
        userId=api_key.userId,
        name=api_key.name,
        provider=api_key.provider,
        isActive=api_key.isActive,
        key=api_key.key,
        createdAt=api_key.createdAt,
        updatedAt=api_key.updatedAt,
    )


async def get_api_key_by_key(key: str) -> Optional[PrismaApiKey]:
    """Get API key by the key value"""
    db = await get_db()
    
    api_key = await db.apikey.find_unique(
        where={"key": key}
    )
    
    return api_key


async def get_user_api_keys(user_id: str) -> List[ApiKeyResponse]:
    """Get all API keys for a user"""
    db = await get_db()
    
    api_keys = await db.apikey.find_many(
        where={"userId": user_id},
        order_by={"createdAt": "desc"}
    )
    
    return [
        ApiKeyResponse(
            id=key.id,
            userId=key.userId,
            name=key.name,
            provider=key.provider,
            isActive=key.isActive,
            createdAt=key.createdAt,
            updatedAt=key.updatedAt,
        )
        for key in api_keys
    ]


async def update_api_key(api_key_id: str, user_id: str, api_key_data: ApiKeyUpdate) -> ApiKeyResponse:
    """Update an API key"""
    db = await get_db()
    
    # Get API key
    api_key = await db.apikey.find_unique(
        where={"id": api_key_id}
    )
    
    if not api_key:
        raise ValueError(f"API key with ID {api_key_id} not found")
    
    # Check ownership
    if api_key.userId != user_id:
        raise ValueError("You can only update your own API keys")
    
    # Prepare update data
    update_data = {}
    
    if api_key_data.name is not None:
        update_data["name"] = api_key_data.name
    if api_key_data.isActive is not None:
        update_data["isActive"] = api_key_data.isActive
    
    # Update API key
    updated_key = await db.apikey.update(
        where={"id": api_key_id},
        data=update_data
    )
    
    logger.info(f"Updated API key: {api_key_id}")
    
    return ApiKeyResponse(
        id=updated_key.id,
        userId=updated_key.userId,
        name=updated_key.name,
        provider=updated_key.provider,
        isActive=updated_key.isActive,
        createdAt=updated_key.createdAt,
        updatedAt=updated_key.updatedAt,
    )


async def delete_api_key(api_key_id: str, user_id: str) -> bool:
    """Delete an API key"""
    db = await get_db()
    
    # Get API key
    api_key = await db.apikey.find_unique(
        where={"id": api_key_id}
    )
    
    if not api_key:
        raise ValueError(f"API key with ID {api_key_id} not found")
    
    # Check ownership
    if api_key.userId != user_id:
        raise ValueError("You can only delete your own API keys")
    
    # Delete API key
    await db.apikey.delete(
        where={"id": api_key_id}
    )
    
    logger.info(f"Deleted API key: {api_key_id}")
    
    return True
