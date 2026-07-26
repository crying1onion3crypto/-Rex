"""
Contract Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class ContractStatus(str, Enum):
    """Contract status enum"""
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


class ContractRiskLevel(str, Enum):
    """Contract risk level enum"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ContractBase(BaseModel):
    """Base contract model"""
    title: str = Field(..., max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    folderId: Optional[str] = None
    tags: Optional[List[str]] = []


class ContractCreate(ContractBase):
    """Contract creation model"""
    pass


class ContractUpdate(BaseModel):
    """Contract update model"""
    title: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=2000)
    folderId: Optional[str] = None
    tags: Optional[List[str]] = None


class ContractResponse(BaseModel):
    """Contract response model"""
    id: str
    userId: str
    title: str
    description: Optional[str]
    fileName: str
    filePath: str
    fileSize: int
    fileType: str
    status: ContractStatus
    processingError: Optional[str]
    pageCount: Optional[int]
    wordCount: Optional[int]
    characterCount: Optional[int]
    riskScore: Optional[float]
    riskLevel: Optional[ContractRiskLevel]
    folderId: Optional[str]
    createdAt: datetime
    updatedAt: datetime
    processedAt: Optional[datetime]
    
    # Additional computed fields
    hasAnalysis: bool = False
    tags: List[str] = []

    class Config:
        from_attributes = True


class ContractListResponse(BaseModel):
    """Contract list response model"""
    contracts: List[ContractResponse]
    total: int
    page: int = 1
    pageSize: int = 20
    totalPages: int = 1


class ContractUploadResponse(BaseModel):
    """Contract upload response model"""
    id: str
    fileName: str
    fileSize: int
    fileType: str
    status: ContractStatus
    message: str
