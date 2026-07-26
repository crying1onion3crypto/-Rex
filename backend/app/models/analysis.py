"""
Analysis Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class RiskSeverity(str, Enum):
    """Risk severity enum"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskFlag(BaseModel):
    """Risk flag model"""
    clause: str
    description: str
    severity: RiskSeverity
    category: str  # liability, termination, indemnification, etc.
    location: Optional[str] = None  # page/section where found
    recommendation: Optional[str] = None


class ExtractedClause(BaseModel):
    """Extracted clause model"""
    type: str  # payment_terms, duration, renewal, etc.
    text: str
    summary: str
    startPage: Optional[int] = None
    endPage: Optional[int] = None


class MissingClause(BaseModel):
    """Missing clause model"""
    type: str  # what clause is missing
    description: str
    importance: RiskSeverity
    recommendation: str


class ContractSummary(BaseModel):
    """Contract summary model"""
    overview: str
    keyPoints: List[str]
    partiesInvolved: List[str]
    effectiveDate: Optional[str] = None
    terminationDate: Optional[str] = None


class RiskAnalysis(BaseModel):
    """Risk analysis model"""
    overallScore: float
    riskLevel: str
    riskFlags: List[RiskFlag]
    riskDistribution: Dict[str, int]  # severity -> count


class ContractAnalysisResponse(BaseModel):
    """Contract analysis response model"""
    id: str
    contractId: str
    summary: Optional[ContractSummary] = None
    riskAnalysis: Optional[RiskAnalysis] = None
    extractedClauses: Optional[List[ExtractedClause]] = []
    missingClauses: Optional[List[MissingClause]] = []
    detailedAnalysis: Optional[Dict[str, Any]] = None
    processingTimeSeconds: Optional[float] = None
    modelUsed: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class AnalysisRequest(BaseModel):
    """Analysis request model"""
    contractId: str
    focusAreas: Optional[List[str]] = None  # Specific areas to focus on
    customPrompt: Optional[str] = None  # Custom analysis prompt
