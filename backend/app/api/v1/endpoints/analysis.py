"""
Analysis Endpoints
"""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_active_user
from app.models.user import UserResponse
from app.models.analysis import ContractAnalysisResponse, AnalysisRequest
from app.services.analysis import get_contract_analysis, analyze_contract

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/analysis")


@router.get("/{contract_id}", response_model=Optional[ContractAnalysisResponse])
async def get_analysis(
    contract_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get analysis results for a contract"""
    try:
        # Verify contract belongs to user
        from app.services.contract import get_contract_by_id
        contract = await get_contract_by_id(contract_id, current_user.id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        # Get analysis
        analysis = await get_contract_analysis(contract_id)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Failed to get analysis for contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get analysis",
        )


@router.post("/{contract_id}", response_model=ContractAnalysisResponse)
async def create_analysis(
    contract_id: str,
    analysis_request: Optional[AnalysisRequest] = None,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create or trigger analysis for a contract"""
    try:
        # Verify contract belongs to user
        from app.services.contract import get_contract_by_id
        contract = await get_contract_by_id(contract_id, current_user.id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        # Trigger analysis
        analysis = await analyze_contract(
            contract_id=contract_id,
            user_id=current_user.id,
            analysis_request=analysis_request,
        )
        
        logger.info(f"User {current_user.id} created analysis for contract: {contract_id}")
        
        return analysis
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to create analysis for contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create analysis",
        )


@router.get("/{contract_id}/status")
async def get_analysis_status(
    contract_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get analysis status for a contract"""
    try:
        # Verify contract belongs to user
        from app.services.contract import get_contract_by_id
        contract = await get_contract_by_id(contract_id, current_user.id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        # Check if analysis exists
        analysis = await get_contract_analysis(contract_id)
        
        if analysis:
            status = "complete"
        elif contract.status == "processing":
            status = "processing"
        elif contract.status == "failed":
            status = "failed"
        else:
            status = "pending"
        
        return {
            "contractId": contract_id,
            "status": status,
            "hasAnalysis": analysis is not None,
            "analysisId": analysis.id if analysis else None,
        }
        
    except Exception as e:
        logger.error(f"Failed to get analysis status for contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get analysis status",
        )
