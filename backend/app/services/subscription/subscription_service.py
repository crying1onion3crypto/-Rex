"""
Subscription Service Implementation
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, List

from prisma.models import Subscription as PrismaSubscription
from prisma.models import Plan as PrismaPlan

from app.config import settings
from app.core.dependencies.database import get_db
from app.models.subscription import SubscriptionResponse, PlanResponse, SubscriptionStatus

logger = logging.getLogger(__name__)


async def get_plans() -> List[PlanResponse]:
    """Get all available plans"""
    db = await get_db()
    
    plans = await db.plan.find_many(
        where={"isActive": True},
        order_by={"price": "asc"}
    )
    
    return [
        PlanResponse(
            id=plan.id,
            name=plan.name,
            description=plan.description,
            price=plan.price,
            currency=plan.currency,
            interval=plan.interval,
            contractLimit=plan.contractLimit,
            features=plan.features or [],
            isActive=plan.isActive,
            createdAt=plan.createdAt,
            updatedAt=plan.updatedAt,
        )
        for plan in plans
    ]


async def get_plan_by_id(plan_id: str) -> Optional[PlanResponse]:
    """Get a plan by ID"""
    db = await get_db()
    
    plan = await db.plan.find_unique(
        where={"id": plan_id}
    )
    
    if plan:
        return PlanResponse(
            id=plan.id,
            name=plan.name,
            description=plan.description,
            price=plan.price,
            currency=plan.currency,
            interval=plan.interval,
            contractLimit=plan.contractLimit,
            features=plan.features or [],
            isActive=plan.isActive,
            createdAt=plan.createdAt,
            updatedAt=plan.updatedAt,
        )
    
    return None


async def get_user_subscription(user_id: str) -> Optional[SubscriptionResponse]:
    """Get subscription for a user"""
    db = await get_db()
    
    subscription = await db.subscription.find_unique(
        where={"userId": user_id}
    )
    
    if not subscription:
        return None
    
    # Get plan details
    plan = await get_plan_by_id(subscription.planId)
    
    # Calculate remaining contracts
    plan_limit = getattr(plan, "contractLimit", settings.FREE_TIER_CONTRACT_LIMIT) if plan else settings.FREE_TIER_CONTRACT_LIMIT
    remaining_contracts = max(0, plan_limit - subscription.contractsUsed)
    
    # Check if in trial
    is_trial = subscription.trialEnd and subscription.trialEnd > datetime.utcnow()
    
    return SubscriptionResponse(
        id=subscription.id,
        userId=subscription.userId,
        planId=subscription.planId,
        stripeCustomerId=subscription.stripeCustomerId,
        stripeSubscriptionId=subscription.stripeSubscriptionId,
        status=SubscriptionStatus(subscription.status),
        currentPeriodEnd=subscription.currentPeriodEnd,
        trialEnd=subscription.trialEnd,
        contractsUsed=subscription.contractsUsed,
        createdAt=subscription.createdAt,
        updatedAt=subscription.updatedAt,
        plan=plan,
        remainingContracts=remaining_contracts,
        isTrial=is_trial,
    )


async def create_free_subscription(user_id: str) -> SubscriptionResponse:
    """Create a free subscription for a user"""
    db = await get_db()
    
    # Check if user already has a subscription
    existing = await db.subscription.find_unique(
        where={"userId": user_id}
    )
    
    if existing:
        return await get_user_subscription(user_id)
    
    # Get free plan
    free_plan = await db.plan.find_first(
        where={"name": "free"}
    )
    
    if not free_plan:
        # Create free plan if it doesn't exist
        free_plan = await db.plan.create(
            data={
                "name": "free",
                "description": "Free tier - 5 contracts per month",
                "price": 0,
                "currency": "USD",
                "interval": "month",
                "contractLimit": settings.FREE_TIER_CONTRACT_LIMIT,
                "features": ["Basic contract analysis", "Limited storage"],
                "isActive": True,
            }
        )
    
    # Create subscription
    subscription = await db.subscription.create(
        data={
            "userId": user_id,
            "planId": free_plan.id,
            "status": "active",
            "contractsUsed": 0,
        }
    )
    
    logger.info(f"Created free subscription for user {user_id}")
    
    return await get_user_subscription(user_id)


async def upgrade_subscription(
    user_id: str,
    plan_id: str,
    stripe_customer_id: Optional[str] = None,
    stripe_subscription_id: Optional[str] = None,
) -> SubscriptionResponse:
    """Upgrade user's subscription"""
    db = await get_db()
    
    # Get user's current subscription
    current_subscription = await db.subscription.find_unique(
        where={"userId": user_id}
    )
    
    # Get the new plan
    new_plan = await db.plan.find_unique(
        where={"id": plan_id}
    )
    
    if not new_plan:
        raise ValueError(f"Plan with ID {plan_id} not found")
    
    if current_subscription:
        # Update existing subscription
        subscription = await db.subscription.update(
            where={"id": current_subscription.id},
            data={
                "planId": plan_id,
                "stripeCustomerId": stripe_customer_id,
                "stripeSubscriptionId": stripe_subscription_id,
                "status": "active",
                "updatedAt": datetime.utcnow(),
            }
        )
    else:
        # Create new subscription
        subscription = await db.subscription.create(
            data={
                "userId": user_id,
                "planId": plan_id,
                "stripeCustomerId": stripe_customer_id,
                "stripeSubscriptionId": stripe_subscription_id,
                "status": "active",
                "contractsUsed": 0,
            }
        )
    
    logger.info(f"Upgraded subscription for user {user_id} to plan {plan_id}")
    
    return await get_user_subscription(user_id)


async def increment_contract_count(user_id: str) -> int:
    """Increment the contract count for a user's subscription"""
    db = await get_db()
    
    subscription = await db.subscription.find_unique(
        where={"userId": user_id}
    )
    
    if subscription:
        subscription = await db.subscription.update(
            where={"id": subscription.id},
            data={"contractsUsed": subscription.contractsUsed + 1}
        )
        return subscription.contractsUsed
    
    return 0


async def reset_monthly_contract_count(user_id: str) -> int:
    """Reset the contract count for a user (monthly reset)"""
    db = await get_db()
    
    subscription = await db.subscription.find_unique(
        where={"userId": user_id}
    )
    
    if subscription:
        subscription = await db.subscription.update(
            where={"id": subscription.id},
            data={"contractsUsed": 0}
        )
        return subscription.contractsUsed
    
    return 0
