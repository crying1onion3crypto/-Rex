"""
Folder Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class FolderBase(BaseModel):
    """Base folder model"""
    name: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    color: Optional[str] = Field(None, max_length=20)
    parentId: Optional[str] = None


class FolderCreate(FolderBase):
    """Folder creation model"""
    order: Optional[int] = 0


class FolderUpdate(BaseModel):
    """Folder update model"""
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    color: Optional[str] = Field(None, max_length=20)
    parentId: Optional[str] = None
    order: Optional[int] = None


class FolderResponse(BaseModel):
    """Folder response model"""
    id: str
    userId: str
    name: str
    description: Optional[str]
    color: Optional[str]
    parentId: Optional[str]
    order: int
    isPublic: bool
    createdAt: datetime
    updatedAt: datetime
    
    # Additional computed fields
    contractCount: int = 0
    children: List["FolderResponse"] = []

    class Config:
        from_attributes = True
