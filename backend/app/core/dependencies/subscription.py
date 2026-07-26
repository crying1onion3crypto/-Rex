"""
Subscription Limit Checking Dependencies
"""

import logging
from typing import Optional

from fastapi import HTTPException, status, Depends

from app.config import settings
from app.models.user import User
from app.models.subscription import Subscription
from app.core.security.auth import get_current_active_user
from app.services.subscription import get_user_subscription

logger = logging.getLogger(__name__)


async def check_subscription_limit(
    current_user: User = Depends(get_current_active_user)
) -> Subscription:
    """Check if user has reached their contract limit"""
    subscription = await get_user_subscription(current_user.id)
    
    if subscription is None:
        # Create default free subscription if none exists
        from app.services.subscription import create_free_subscription
        subscription = await create_free_subscription(current_user.id)
    
    # Check if user has reached their limit
    if subscription.contractsUsed >= get_subscription_limit(subscription.planId):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"You have reached your limit of {get_subscription_limit(subscription.planId)} contracts per month. Please upgrade your plan.",
        )
    
    return subscription


def get_subscription_limit(plan_id: str) -> int:
    """Get contract limit for a plan"""
    plan_limits = {
        "free": settings.FREE_TIER_CONTRACT_LIMIT,
        "pro": settings.PRO_TIER_CONTRACT_LIMIT,
    }
    return plan_limits.get(plan_id, settings.FREE_TIER_CONTRACT_LIMIT)


async def check_subscription_status(
    current_user: User = Depends(get_current_active_user)
) -> Subscription:
    """Check if user's subscription is active"""
    subscription = await get_user_subscription(current_user.id)
    
    if subscription is None:
        from app.services.subscription import create_free_subscription
        subscription = await create_free_subscription(current_user.id)
    
    if subscription.status != "active":
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Your subscription is {subscription.status}. Please renew your subscription.",
        )
    
    return subscription
