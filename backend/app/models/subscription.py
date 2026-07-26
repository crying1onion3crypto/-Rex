"""
Subscription Models (Pydantic Schemas)
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class SubscriptionStatus(str, Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"


class PlanResponse(BaseModel):
    """Plan response model"""
    id: str
    name: str
    description: Optional[str]
    price: float
    currency: str
    interval: str
    contractLimit: int
    features: Optional[List[str]] = []
    isActive: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    """Subscription response model"""
    id: str
    userId: str
    planId: str
    stripeCustomerId: Optional[str]
    stripeSubscriptionId: Optional[str]
    status: SubscriptionStatus
    currentPeriodEnd: Optional[datetime]
    trialEnd: Optional[datetime]
    contractsUsed: int
    createdAt: datetime
    updatedAt: datetime
    
    # Additional computed fields
    plan: Optional[PlanResponse] = None
    remainingContracts: int = 0
    isTrial: bool = False

    class Config:
        from_attributes = True


class PaymentMethodResponse(BaseModel):
    """Payment method response model"""
    id: str
    type: str
    last4: Optional[str]
    brand: Optional[str]
    isDefault: bool
    createdAt: datetime

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    """Invoice response model"""
    id: str
    amountDue: float
    currency: str
    status: str
    dueDate: Optional[datetime]
    pdfUrl: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True
