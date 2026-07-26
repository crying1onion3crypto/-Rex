"""
Authentication Endpoints
"""

import logging
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer

from app.config import settings
from app.core.security import create_access_token, create_refresh_token, get_current_user
from app.core.security.jwt import decode_token, TokenData
from app.models.user import UserLogin, TokenResponse, RefreshTokenRequest, UserResponse
from app.services.user import authenticate_user, get_user_by_id

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/auth")


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Login user with email and password"""
    # Authenticate user
    user = await authenticate_user(user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    token_data = {"sub": user.id, "email": user.email}
    
    access_token = create_access_token(
        data=token_data,
        expires_delta=timedelta(days=settings.JWT_EXPIRY_DAYS)
    )
    
    refresh_token = create_refresh_token(
        data=token_data,
        expires_delta=timedelta(days=settings.JWT_EXPIRY_DAYS * 2)
    )
    
    logger.info(f"User logged in: {user.id}")
    
    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        tokenType="bearer",
        expiresIn=settings.JWT_EXPIRY_DAYS * 24 * 60 * 60,  # seconds
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_data: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        # Decode refresh token
        token_data = decode_token(refresh_data.refreshToken)
        
        if token_data.user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user
        user = await get_user_by_id(token_data.user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new tokens
        new_token_data = {"sub": user.id, "email": user.email}
        
        new_access_token = create_access_token(
            data=new_token_data,
            expires_delta=timedelta(days=settings.JWT_EXPIRY_DAYS)
        )
        
        new_refresh_token = create_refresh_token(
            data=new_token_data,
            expires_delta=timedelta(days=settings.JWT_EXPIRY_DAYS * 2)
        )
        
        logger.info(f"Token refreshed for user: {user.id}")
        
        return TokenResponse(
            accessToken=new_access_token,
            refreshToken=new_refresh_token,
            tokenType="bearer",
            expiresIn=settings.JWT_EXPIRY_DAYS * 24 * 60 * 60,
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout")
async def logout(current_user: Annotated[UserResponse, Depends(get_current_user)]):
    """Logout user (invalidate token)"""
    # In a real implementation, you would add the token to a blacklist
    # For JWT, logout is typically handled client-side by removing the token
    
    logger.info(f"User logged out: {current_user.id}")
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(current_user: Annotated[UserResponse, Depends(get_current_user)]):
    """Get current authenticated user"""
    return current_user
