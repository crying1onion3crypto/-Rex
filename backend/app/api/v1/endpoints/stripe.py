"""
Stripe Webhook Endpoints
"""

import logging
import httpx
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.dependencies.database import get_db
from app.core.security.auth import get_current_active_user
from app.models.user import UserResponse

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/stripe")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Annotated[str, Header()]],
):
    """Handle Stripe webhook events"""
    try:
        # Get the raw request body
        body = await request.body()
        
        # Verify webhook signature
        import stripe
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        try:
            event = stripe.Webhook.construct_event(
                body.decode('utf-8'),
                stripe_signature,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Handle the event
        db = await get_db()
        
        if event.type == 'checkout.session.completed':
            session = event.data.object
            # Handle successful checkout
            logger.info(f"Checkout session completed: {session.id}")
            
            # Extract user ID and plan ID from metadata
            user_id = session.metadata.get('userId')
            plan_id = session.metadata.get('planId')
            
            if user_id and plan_id:
                # Update user's subscription
                subscription = await db.subscription.find_unique(
                    where={"userId": user_id}
                )
                
                if subscription:
                    await db.subscription.update(
                        where={"id": subscription.id},
                        data={
                            "planId": plan_id,
                            "stripeCustomerId": session.customer,
                            "stripeSubscriptionId": session.subscription,
                            "status": "active",
                        }
                    )
                else:
                    await db.subscription.create(
                        data={
                            "userId": user_id,
                            "planId": plan_id,
                            "stripeCustomerId": session.customer,
                            "stripeSubscriptionId": session.subscription,
                            "status": "active",
                            "contractsUsed": 0,
                        }
                    )
                
                logger.info(f"Updated subscription for user {user_id} to plan {plan_id}")
        
        elif event.type == 'invoice.payment_succeeded':
            invoice = event.data.object
            logger.info(f"Invoice payment succeeded: {invoice.id}")
            
            # Reset contract count for new period
            customer_id = invoice.customer
            subscription = await db.subscription.find_first(
                where={"stripeCustomerId": customer_id}
            )
            
            if subscription:
                await db.subscription.update(
                    where={"id": subscription.id},
                    data={"contractsUsed": 0}
                )
                logger.info(f"Reset contract count for subscription {subscription.id}")
        
        elif event.type == 'invoice.payment_failed':
            invoice = event.data.object
            logger.warning(f"Invoice payment failed: {invoice.id}")
            
            # Update subscription status
            customer_id = invoice.customer
            subscription = await db.subscription.find_first(
                where={"stripeCustomerId": customer_id}
            )
            
            if subscription:
                await db.subscription.update(
                    where={"id": subscription.id},
                    data={"status": "past_due"}
                )
                logger.warning(f"Updated subscription {subscription.id} to past_due")
        
        elif event.type == 'customer.subscription.updated':
            subscription_data = event.data.object
            logger.info(f"Subscription updated: {subscription_data.id}")
            
            # Update subscription details
            subscription = await db.subscription.find_first(
                where={"stripeSubscriptionId": subscription_data.id}
            )
            
            if subscription:
                await db.subscription.update(
                    where={"id": subscription.id},
                    data={
                        "status": subscription_data.status,
                        "currentPeriodEnd": subscription_data.current_period_end,
                    }
                )
                logger.info(f"Updated subscription {subscription.id}")
        
        elif event.type == 'customer.subscription.deleted':
            subscription_data = event.data.object
            logger.info(f"Subscription deleted: {subscription_data.id}")
            
            # Update subscription status
            subscription = await db.subscription.find_first(
                where={"stripeSubscriptionId": subscription_data.id}
            )
            
            if subscription:
                await db.subscription.update(
                    where={"id": subscription.id},
                    data={"status": "canceled"}
                )
                logger.info(f"Updated subscription {subscription.id} to canceled")
        
        else:
            logger.info(f"Unhandled event type: {event.type}")
        
        return JSONResponse(status_code=200, content={"received": True})
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )


@router.post("/create-checkout-session")
async def create_checkout_session(
    plan_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create Stripe checkout session for subscription upgrade"""
    try:
        import stripe
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        # Get plan details
        plan = await db.plan.find_unique(
            where={"id": plan_id}
        )
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Plan not found"
            )
        
        # Get user's current subscription
        subscription = await db.subscription.find_unique(
            where={"userId": current_user.id}
        )
        
        # Create or get Stripe customer
        if subscription and subscription.stripeCustomerId:
            customer_id = subscription.stripeCustomerId
        else:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=f"{current_user.firstName or ''} {current_user.lastName or ''}".strip() or current_user.email,
                metadata={"userId": current_user.id}
            )
            customer_id = customer.id
            
            # Update subscription with customer ID
            if subscription:
                await db.subscription.update(
                    where={"id": subscription.id},
                    data={"stripeCustomerId": customer_id}
                )
        
        # Create checkout session
        session = stripe.Checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': settings.STRIPE_PRO_PLAN_PRICE_ID,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{settings.NEXTAUTH_URL}/settings/billing?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.NEXTAUTH_URL}/settings/billing",
            customer=customer_id,
            metadata={
                "userId": current_user.id,
                "planId": plan_id,
            },
            subscription_data={
                "metadata": {
                    "userId": current_user.id,
                    "planId": plan_id,
                }
            }
        )
        
        logger.info(f"Created checkout session {session.id} for user {current_user.id}")
        
        return {"sessionId": session.id, "url": session.url}
        
    except Exception as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create checkout session"
        )


@router.post("/create-billing-portal")
async def create_billing_portal(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create Stripe billing portal session"""
    try:
        import stripe
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        # Get user's subscription
        subscription = await db.subscription.find_unique(
            where={"userId": current_user.id}
        )
        
        if not subscription or not subscription.stripeCustomerId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Stripe customer found for this user"
            )
        
        # Create billing portal session
        session = stripe.billing_portal.Session.create(
            customer=subscription.stripeCustomerId,
            return_url=f"{settings.NEXTAUTH_URL}/settings/billing",
            configuration={
                "business_profile": {
                    "name": "Contract AI SaaS",
                }
            }
        )
        
        logger.info(f"Created billing portal session {session.id} for user {current_user.id}")
        
        return {"url": session.url}
        
    except Exception as e:
        logger.error(f"Failed to create billing portal: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create billing portal"
        )
