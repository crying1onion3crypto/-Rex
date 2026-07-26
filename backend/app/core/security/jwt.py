"""
JWT Token Management
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)


class TokenData(BaseModel):
    """JWT Token Data Model"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    exp: Optional[datetime] = None


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.JWT_EXPIRY_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access",
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Refresh tokens typically have longer expiry
        expire = datetime.utcnow() + timedelta(days=settings.JWT_EXPIRY_DAYS * 2)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        token_data = TokenData(
            user_id=payload.get("sub"),
            email=payload.get("email"),
            exp=datetime.fromtimestamp(payload.get("exp", 0)) if payload.get("exp") else None
        )
        
        return token_data
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise ValueError(f"Invalid token: {e}")


def verify_token(token: str) -> bool:
    """Verify if a token is valid"""
    try:
        jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return True
    except JWTError:
        return False


def get_token_expiry(token: str) -> Optional[datetime]:
    """Get token expiry time"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            return datetime.fromtimestamp(exp_timestamp)
        return None
    except JWTError:
        return None
