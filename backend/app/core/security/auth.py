"""
Authentication Dependencies and Utilities
"""

import logging
from typing import Optional, Annotated

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.config import settings
from app.core.security.jwt import decode_token
from app.services.user import get_user_by_id
from app.models.user import User

logger = logging.getLogger(__name__)

# HTTP Bearer security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> User:
    """Get the current authenticated user"""
    try:
        token = credentials.credentials
        token_data = decode_token(token)
        
        if token_data.user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = await get_user_by_id(token_data.user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except JWTError as e:
        logger.error(f"JWT error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current active user"""
    if not current_user.isActive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


async def get_optional_user(request: Request) -> Optional[User]:
    """Get user if authenticated, otherwise return None"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split("Bearer ")[1]
        token_data = decode_token(token)
        
        if token_data.user_id:
            return await get_user_by_id(token_data.user_id)
        
        return None
    except Exception:
        return None


async def verify_api_key(api_key: str) -> bool:
    """Verify if an API key is valid"""
    from app.services.user import get_api_key_by_key
    
    key_record = await get_api_key_by_key(api_key)
    return key_record is not None and key_record.isActive
