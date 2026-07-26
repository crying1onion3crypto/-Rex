"""
User Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    firstName: Optional[str] = Field(None, max_length=100)
    lastName: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """User update model"""
    email: Optional[EmailStr] = None
    firstName: Optional[str] = Field(None, max_length=100)
    lastName: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    currentPassword: Optional[str] = None
    newPassword: Optional[str] = Field(None, min_length=8, max_length=100)


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: EmailStr
    firstName: Optional[str]
    lastName: Optional[str]
    company: Optional[str]
    phone: Optional[str]
    isActive: bool
    isVerified: bool
    emailVerified: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response model"""
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
    expiresIn: int  # seconds


class RefreshTokenRequest(BaseModel):
    """Refresh token request model"""
    refreshToken: str
