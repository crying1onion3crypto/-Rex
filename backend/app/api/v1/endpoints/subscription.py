"""
Subscription Endpoints
"""

import logging
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.models.user import UserResponse
from app.models.subscription import SubscriptionResponse, PlanResponse
from app.services.subscription import (
    get_user_subscription,
    create_free_subscription,
    upgrade_subscription,
    get_plans,
    get_plan_by_id,
)

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/subscription")


@router.get("/plans", response_model=List[PlanResponse])
async def list_plans():
    """List all available subscription plans"""
    try:
        plans = await get_plans()
        return plans
    except Exception as e:
        logger.error(f"Failed to list plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list plans",
        )


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: str):
    """Get a specific plan"""
    try:
        plan = await get_plan_by_id(plan_id)
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found",
            )
        
        return plan
    except Exception as e:
        logger.error(f"Failed to get plan {plan_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get plan",
        )


@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get current user's subscription"""
    try:
        subscription = await get_user_subscription(current_user.id)
        
        if not subscription:
            # Create free subscription if none exists
            subscription = await create_free_subscription(current_user.id)
        
        return subscription
    except Exception as e:
        logger.error(f"Failed to get subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get subscription",
        )


@router.post("/upgrade/{plan_id}", response_model=SubscriptionResponse)
async def upgrade_my_subscription(
    plan_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Upgrade current user's subscription"""
    try:
        subscription = await upgrade_subscription(
            user_id=current_user.id,
            plan_id=plan_id,
        )
        
        logger.info(f"User {current_user.id} upgraded to plan {plan_id}")
        
        return subscription
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to upgrade subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade subscription",
        )


@router.get("/usage")
async def get_subscription_usage(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get subscription usage statistics"""
    try:
        subscription = await get_user_subscription(current_user.id)
        
        if not subscription:
            subscription = await create_free_subscription(current_user.id)
        
        # Get plan details
        plan = await get_plan_by_id(subscription.planId)
        plan_limit = plan.contractLimit if plan else settings.FREE_TIER_CONTRACT_LIMIT
        
        return {
            "planId": subscription.planId,
            "planName": plan.name if plan else "free",
            "contractsUsed": subscription.contractsUsed,
            "contractLimit": plan_limit,
            "remainingContracts": max(0, plan_limit - subscription.contractsUsed),
            "usagePercentage": round((subscription.contractsUsed / plan_limit) * 100, 2) if plan_limit > 0 else 0,
        }
    except Exception as e:
        logger.error(f"Failed to get usage for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get usage",
        )
