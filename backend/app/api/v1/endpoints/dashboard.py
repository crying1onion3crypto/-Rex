"""
Dashboard Endpoints
"""

import logging
from datetime import datetime, timedelta
from typing import Annotated, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.models.user import UserResponse
from app.models.contract import ContractResponse, ContractStatus
from app.services.contract import get_user_contracts
from app.services.analysis import get_contract_analysis
from app.services.subscription import get_user_subscription, get_plans
from app.core.dependencies.database import get_db

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/dashboard")


@router.get("/stats")
async def get_dashboard_stats(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get dashboard statistics"""
    try:
        db = await get_db()
        
        # Get contract counts by status
        total_contracts = await db.contract.count(
            where={"userId": current_user.id}
        )
        
        processing_contracts = await db.contract.count(
            where={
                "userId": current_user.id,
                "status": ContractStatus.PROCESSING,
            }
        )
        
        completed_contracts = await db.contract.count(
            where={
                "userId": current_user.id,
                "status": ContractStatus.COMPLETE,
            }
        )
        
        failed_contracts = await db.contract.count(
            where={
                "userId": current_user.id,
                "status": ContractStatus.FAILED,
            }
        )
        
        # Get contracts with risk scores
        contracts_with_risk = await db.contract.find_many(
            where={
                "userId": current_user.id,
                "riskScore": {"not": None},
            }
        )
        
        # Calculate risk distribution
        risk_distribution = {
            "low": 0,
            "medium": 0,
            "high": 0,
            "critical": 0,
        }
        
        for contract in contracts_with_risk:
            risk_level = contract.riskLevel or "low"
            if risk_level in risk_distribution:
                risk_distribution[risk_level] += 1
        
        # Get subscription info
        subscription = await get_user_subscription(current_user.id)
        if not subscription:
            from app.services.subscription import create_free_subscription
            subscription = await create_free_subscription(current_user.id)
        
        plan_limit = 0
        if subscription.plan:
            plan_limit = subscription.plan.contractLimit
        else:
            from app.config import settings
            plan_limit = settings.FREE_TIER_CONTRACT_LIMIT
        
        # Get recent activity
        recent_contracts = await db.contract.find_many(
            where={"userId": current_user.id},
            order_by={"createdAt": "desc"},
            take=5,
        )
        
        recent_activity = []
        for contract in recent_contracts:
            recent_activity.append({
                "id": contract.id,
                "title": contract.title,
                "action": "upload",
                "timestamp": contract.createdAt,
                "status": contract.status,
            })
        
        # Get average risk score
        avg_risk_score = 0
        if contracts_with_risk:
            total_risk = sum(c.riskScore or 0 for c in contracts_with_risk)
            avg_risk_score = round(total_risk / len(contracts_with_risk), 2)
        
        return {
            "totalContracts": total_contracts,
            "processingContracts": processing_contracts,
            "completedContracts": completed_contracts,
            "failedContracts": failed_contracts,
            "riskDistribution": risk_distribution,
            "averageRiskScore": avg_risk_score,
            "subscription": {
                "planId": subscription.planId,
                "planName": subscription.plan.name if subscription.plan else "free",
                "contractsUsed": subscription.contractsUsed,
                "contractLimit": plan_limit,
                "remainingContracts": max(0, plan_limit - subscription.contractsUsed),
                "usagePercentage": round((subscription.contractsUsed / plan_limit) * 100, 2) if plan_limit > 0 else 0,
            },
            "recentActivity": recent_activity,
        }
        
    except Exception as e:
        logger.error(f"Failed to get dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard stats",
        )


@router.get("/recent-contracts")
async def get_recent_contracts(
    limit: int = 10,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get recent contracts for dashboard"""
    try:
        contracts = await get_user_contracts(
            user_id=current_user.id,
            page=1,
            page_size=limit,
        )
        
        return {
            "contracts": contracts.contracts,
            "total": contracts.total,
        }
        
    except Exception as e:
        logger.error(f"Failed to get recent contracts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recent contracts",
        )


@router.get("/risk-overview")
async def get_risk_overview(
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get risk overview for dashboard"""
    try:
        db = await get_db()
        
        # Get contracts with risk scores
        contracts = await db.contract.find_many(
            where={
                "userId": current_user.id,
                "riskScore": {"not": None},
            },
            order_by={"riskScore": "desc"},
            include={"analysis": True}
        )
        
        # Prepare risk overview
        risk_overview = []
        for contract in contracts:
            analysis = contract.analysis
            risk_flags = []
            
            if analysis and analysis.riskFlags:
                risk_flags = [
                    {
                        "clause": flag.get("clause", ""),
                        "severity": flag.get("severity", "low"),
                        "category": flag.get("category", "other"),
                    }
                    for flag in analysis.riskFlags
                ]
            
            risk_overview.append({
                "contractId": contract.id,
                "title": contract.title,
                "riskScore": contract.riskScore or 0,
                "riskLevel": contract.riskLevel or "unknown",
                "riskFlags": risk_flags,
                "fileName": contract.fileName,
                "createdAt": contract.createdAt,
            })
        
        # Sort by risk score descending
        risk_overview.sort(key=lambda x: x["riskScore"], reverse=True)
        
        return {
            "highRiskContracts": [c for c in risk_overview if c["riskLevel"] in ["high", "critical"]],
            "mediumRiskContracts": [c for c in risk_overview if c["riskLevel"] == "medium"],
            "lowRiskContracts": [c for c in risk_overview if c["riskLevel"] == "low"],
            "allContracts": risk_overview,
        }
        
    except Exception as e:
        logger.error(f"Failed to get risk overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get risk overview",
        )


@router.get("/activity")
async def get_activity_feed(
    limit: int = 20,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get activity feed for dashboard"""
    try:
        db = await get_db()
        
        # Get recent contracts
        contracts = await db.contract.find_many(
            where={"userId": current_user.id},
            order_by={"createdAt": "desc"},
            take=limit,
        )
        
        # Get recent analyses
        analyses = await db.contractanalysis.find_many(
            where={"contract": {"userId": current_user.id}},
            order_by={"createdAt": "desc"},
            take=limit,
        )
        
        # Combine and sort by timestamp
        activity = []
        
        for contract in contracts:
            activity.append({
                "type": "contract_upload",
                "entityId": contract.id,
                "entityType": "contract",
                "title": contract.title,
                "message": f"Uploaded contract: {contract.title}",
                "timestamp": contract.createdAt,
                "status": contract.status,
            })
        
        for analysis in analyses:
            activity.append({
                "type": "contract_analysis",
                "entityId": analysis.contractId,
                "entityType": "analysis",
                "title": f"Analysis for contract {analysis.contractId}",
                "message": f"Completed analysis for contract",
                "timestamp": analysis.createdAt,
                "status": "complete",
            })
        
        # Sort by timestamp descending
        activity.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "activity": activity[:limit],
            "total": len(activity),
        }
        
    except Exception as e:
        logger.error(f"Failed to get activity feed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get activity feed",
        )
