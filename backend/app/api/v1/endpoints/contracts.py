"""
Contracts Endpoints
"""

import logging
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query

from app.core.security import get_current_active_user
from app.core.dependencies.subscription import check_subscription_limit
from app.models.user import UserResponse
from app.models.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractListResponse,
    ContractUploadResponse,
    ContractStatus,
)
from app.services.contract import (
    create_contract,
    get_contract_by_id,
    get_user_contracts,
    update_contract,
    delete_contract,
    upload_contract_file,
)
from app.services.analysis import analyze_contract
from app.services.subscription import increment_contract_count

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/contracts")


@router.post("/upload", response_model=ContractUploadResponse)
async def upload_contract(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    folder_id: Optional[str] = Form(None),
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Upload a contract file"""
    try:
        # Check subscription limit
        await check_subscription_limit(current_user)
        
        # Read file content
        file_content = await file.read()
        
        # Upload contract
        response = await upload_contract_file(
            user_id=current_user.id,
            file_content=file_content,
            file_name=file.filename,
            title=title,
            description=description,
            folder_id=folder_id,
        )
        
        # Increment contract count
        await increment_contract_count(current_user.id)
        
        logger.info(f"User {current_user.id} uploaded contract: {response.id}")
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload contract: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload contract",
        )


@router.post("/", response_model=ContractUploadResponse)
async def create_new_contract(
    contract_data: ContractCreate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create a new contract (without file upload)"""
    try:
        # Check subscription limit
        await check_subscription_limit(current_user)
        
        response = await create_contract(current_user.id, contract_data)
        
        # Increment contract count
        await increment_contract_count(current_user.id)
        
        logger.info(f"User {current_user.id} created contract: {response.id}")
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/", response_model=ContractListResponse)
async def list_contracts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    folder_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """List all contracts for the current user"""
    try:
        contracts = await get_user_contracts(
            user_id=current_user.id,
            page=page,
            page_size=page_size,
            folder_id=folder_id,
            status=status,
            search=search,
            tags=tags,
        )
        
        return contracts
        
    except Exception as e:
        logger.error(f"Failed to list contracts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list contracts",
        )


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get a specific contract"""
    try:
        contract = await get_contract_by_id(contract_id, current_user.id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        return contract
        
    except Exception as e:
        logger.error(f"Failed to get contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get contract",
        )


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract_endpoint(
    contract_id: str,
    contract_data: ContractUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Update a contract"""
    try:
        contract = await update_contract(contract_id, current_user.id, contract_data)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        logger.info(f"User {current_user.id} updated contract: {contract_id}")
        
        return contract
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to update contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update contract",
        )


@router.delete("/{contract_id}")
async def delete_contract_endpoint(
    contract_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Delete a contract"""
    try:
        success = await delete_contract(contract_id, current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        logger.info(f"User {current_user.id} deleted contract: {contract_id}")
        
        return {"message": "Contract deleted successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to delete contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete contract",
        )


@router.post("/{contract_id}/analyze")
async def trigger_analysis(
    contract_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Trigger AI analysis for a contract"""
    try:
        # Get contract to verify it exists
        contract = await get_contract_by_id(contract_id, current_user.id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found",
            )
        
        # Trigger analysis
        analysis = await analyze_contract(contract_id, current_user.id)
        
        logger.info(f"User {current_user.id} triggered analysis for contract: {contract_id}")
        
        return {
            "message": "Analysis started",
            "analysisId": analysis.id,
            "status": "processing",
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to trigger analysis for contract {contract_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger analysis",
        )
