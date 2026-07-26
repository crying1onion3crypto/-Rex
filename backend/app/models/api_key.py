"""
API Key Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class ApiKeyProvider(str, Enum):
    """API key provider enum"""
    DEEPSEEK = "deepseek"
    OPENAI = "openai"
    CUSTOM = "custom"


class ApiKeyBase(BaseModel):
    """Base API key model"""
    name: str = Field(..., max_length=100)
    provider: ApiKeyProvider


class ApiKeyCreate(ApiKeyBase):
    """API key creation model"""
    key: Optional[str] = Field(None, max_length=200)


class ApiKeyUpdate(BaseModel):
    """API key update model"""
    name: Optional[str] = Field(None, max_length=100)
    isActive: Optional[bool] = None


class ApiKeyResponse(BaseModel):
    """API key response model"""
    id: str
    userId: str
    name: str
    provider: ApiKeyProvider
    isActive: bool
    createdAt: datetime
    updatedAt: datetime
    
    # Mask the actual key in responses
    key: Optional[str] = None

    class Config:
        from_attributes = True


class ApiKeyWithSecretResponse(ApiKeyResponse):
    """API key response with secret (for creation)"""
    key: str
