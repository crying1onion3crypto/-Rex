"""
Tag Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TagBase(BaseModel):
    """Base tag model"""
    name: str = Field(..., max_length=50)
    color: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=200)


class TagCreate(TagBase):
    """Tag creation model"""
    pass


class TagUpdate(BaseModel):
    """Tag update model"""
    name: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=200)


class TagResponse(BaseModel):
    """Tag response model"""
    id: str
    userId: str
    name: str
    color: Optional[str]
    description: Optional[str]
    createdAt: datetime
    
    # Additional computed fields
    contractCount: int = 0

    class Config:
        from_attributes = True
