"""
Contract Service Implementation
"""

import logging
import os
import uuid
from datetime import datetime
from typing import Optional, List, Tuple
from pathlib import Path

from prisma.models import Contract as PrismaContract
from prisma.models import Folder, Tag, ContractTag

from app.config import settings
from app.core.dependencies.database import get_db
from app.models.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractListResponse,
    ContractUploadResponse,
    ContractStatus,
)
from app.services.storage import save_file, get_file_info
from app.services.ai import extract_text_from_file

logger = logging.getLogger(__name__)


async def validate_file_type(file_name: str) -> bool:
    """Validate file type is allowed"""
    allowed_types = settings.ALLOWED_FILE_TYPES.split(",")
    file_ext = os.path.splitext(file_name)[1].lower()
    return file_ext in allowed_types


async def validate_file_size(file_size: int) -> bool:
    """Validate file size is within limits"""
    max_size_mb = settings.MAX_FILE_SIZE_MB
    max_size_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_size_bytes


async def create_contract(
    user_id: str,
    contract_data: ContractCreate,
    file_data: Optional[Tuple[bytes, str]] = None
) -> ContractUploadResponse:
    """Create a new contract"""
    db = await get_db()
    
    # Validate folder exists if specified
    if contract_data.folderId:
        folder = await db.folder.find_unique(
            where={"id": contract_data.folderId}
        )
        if not folder:
            raise ValueError(f"Folder with ID {contract_data.folderId} not found")
    
    # Handle file upload
    file_name = ""
    file_path = ""
    file_size = 0
    file_type = ""
    
    if file_data:
        file_content, original_file_name = file_data
        
        # Validate file
        if not await validate_file_type(original_file_name):
            raise ValueError(f"File type not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}")
        
        if not await validate_file_size(len(file_content)):
            raise ValueError(f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB")
        
        # Generate unique file name
        file_ext = os.path.splitext(original_file_name)[1]
        file_name = f"{uuid.uuid4().hex}{file_ext}"
        file_path = f"contracts/{user_id}/{file_name}"
        
        # Save file
        await save_file(file_path, file_content)
        
        file_size = len(file_content)
        file_type = file_ext.lower().lstrip(".")
        
        # Extract basic info
        try:
            file_info = await get_file_info(file_path)
            if file_info:
                file_size = file_info.get("size", file_size)
        except Exception as e:
            logger.warning(f"Failed to get file info: {e}")
    
    # Create contract
    contract = await db.contract.create(
        data={
            "userId": user_id,
            "title": contract_data.title,
            "description": contract_data.description,
            "fileName": file_name or contract_data.title,
            "filePath": file_path,
            "fileSize": file_size,
            "fileType": file_type,
            "status": ContractStatus.UPLOADING,
            "folderId": contract_data.folderId,
        }
    )
    
    # Add tags if provided
    if contract_data.tags:
        for tag_name in contract_data.tags:
            # Find or create tag
            tag = await db.tag.find_first(
                where={
                    "userId": user_id,
                    "name": tag_name
                }
            )
            
            if not tag:
                tag = await db.tag.create(
                    data={
                        "userId": user_id,
                        "name": tag_name,
                    }
                )
            
            # Link tag to contract
            await db.contracttag.create(
                data={
                    "contractId": contract.id,
                    "tagId": tag.id,
                }
            )
    
    logger.info(f"Created new contract: {contract.id}")
    
    return ContractUploadResponse(
        id=contract.id,
        fileName=contract.fileName,
        fileSize=contract.fileSize,
        fileType=contract.fileType,
        status=contract.status,
        message="Contract uploaded successfully"
    )


async def get_contract_by_id(contract_id: str, user_id: Optional[str] = None) -> Optional[ContractResponse]:
    """Get contract by ID"""
    db = await get_db()
    
    # Get contract
    contract = await db.contract.find_unique(
        where={"id": contract_id}
    )
    
    if not contract:
        return None
    
    # Check ownership if user_id provided
    if user_id and contract.userId != user_id:
        return None
    
    # Get tags
    contract_tags = await db.contracttag.find_many(
        where={"contractId": contract_id},
        include={"tag": True}
    )
    
    tags = [tag.tag.name for tag in contract_tags]
    
    # Check if analysis exists
    analysis = await db.contractanalysis.find_unique(
        where={"contractId": contract_id}
    )
    
    return ContractResponse(
        id=contract.id,
        userId=contract.userId,
        title=contract.title,
        description=contract.description,
        fileName=contract.fileName,
        filePath=contract.filePath,
        fileSize=contract.fileSize,
        fileType=contract.fileType,
        status=contract.status,
        processingError=contract.processingError,
        pageCount=contract.pageCount,
        wordCount=contract.wordCount,
        characterCount=contract.characterCount,
        riskScore=contract.riskScore,
        riskLevel=contract.riskLevel,
        folderId=contract.folderId,
        createdAt=contract.createdAt,
        updatedAt=contract.updatedAt,
        processedAt=contract.processedAt,
        hasAnalysis=analysis is not None,
        tags=tags,
    )


async def get_user_contracts(
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    folder_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> ContractListResponse:
    """Get all contracts for a user with pagination and filtering"""
    db = await get_db()
    
    # Build where clause
    where = {"userId": user_id}
    
    if folder_id:
        where["folderId"] = folder_id
    
    if status:
        where["status"] = status
    
    if search:
        where["OR"] = [
            {"title": {"contains": search}},
            {"description": {"contains": search}},
            {"fileName": {"contains": search}},
        ]
    
    # Get contracts
    skip = (page - 1) * page_size
    
    contracts = await db.contract.find_many(
        where=where,
        skip=skip,
        take=page_size,
        order_by={"createdAt": "desc"}
    )
    
    # Get total count
    total = await db.contract.count(where=where)
    
    # Get tags for each contract
    contract_responses = []
    for contract in contracts:
        contract_tags = await db.contracttag.find_many(
            where={"contractId": contract.id},
            include={"tag": True}
        )
        tags = [tag.tag.name for tag in contract_tags]
        
        # Check if analysis exists
        analysis = await db.contractanalysis.find_unique(
            where={"contractId": contract.id}
        )
        
        contract_responses.append(
            ContractResponse(
                id=contract.id,
                userId=contract.userId,
                title=contract.title,
                description=contract.description,
                fileName=contract.fileName,
                filePath=contract.filePath,
                fileSize=contract.fileSize,
                fileType=contract.fileType,
                status=contract.status,
                processingError=contract.processingError,
                pageCount=contract.pageCount,
                wordCount=contract.wordCount,
                characterCount=contract.characterCount,
                riskScore=contract.riskScore,
                riskLevel=contract.riskLevel,
                folderId=contract.folderId,
                createdAt=contract.createdAt,
                updatedAt=contract.updatedAt,
                processedAt=contract.processedAt,
                hasAnalysis=analysis is not None,
                tags=tags,
            )
        )
    
    # Filter by tags if specified
    if tags:
        contract_responses = [
            c for c in contract_responses
            if all(tag in c.tags for tag in tags)
        ]
        total = len(contract_responses)
    
    total_pages = (total + page_size - 1) // page_size
    
    return ContractListResponse(
        contracts=contract_responses,
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages,
    )


async def update_contract(contract_id: str, user_id: str, contract_data: ContractUpdate) -> ContractResponse:
    """Update a contract"""
    db = await get_db()
    
    # Get contract
    contract = await db.contract.find_unique(
        where={"id": contract_id}
    )
    
    if not contract:
        raise ValueError(f"Contract with ID {contract_id} not found")
    
    # Check ownership
    if contract.userId != user_id:
        raise ValueError("You can only update your own contracts")
    
    # Prepare update data
    update_data = {}
    
    if contract_data.title is not None:
        update_data["title"] = contract_data.title
    if contract_data.description is not None:
        update_data["description"] = contract_data.description
    if contract_data.folderId is not None:
        # Validate folder exists
        folder = await db.folder.find_unique(
            where={"id": contract_data.folderId}
        )
        if not folder:
            raise ValueError(f"Folder with ID {contract_data.folderId} not found")
        update_data["folderId"] = contract_data.folderId
    
    # Update contract
    updated_contract = await db.contract.update(
        where={"id": contract_id},
        data=update_data
    )
    
    # Update tags if provided
    if contract_data.tags is not None:
        # Remove existing tags
        await db.contracttag.delete_many(
            where={"contractId": contract_id}
        )
        
        # Add new tags
        for tag_name in contract_data.tags:
            tag = await db.tag.find_first(
                where={
                    "userId": user_id,
                    "name": tag_name
                }
            )
            
            if not tag:
                tag = await db.tag.create(
                    data={
                        "userId": user_id,
                        "name": tag_name,
                    }
                )
            
            await db.contracttag.create(
                data={
                    "contractId": contract_id,
                    "tagId": tag.id,
                }
            )
    
    logger.info(f"Updated contract: {contract_id}")
    
    # Return updated contract
    return await get_contract_by_id(contract_id, user_id)


async def delete_contract(contract_id: str, user_id: str) -> bool:
    """Delete a contract"""
    db = await get_db()
    
    # Get contract
    contract = await db.contract.find_unique(
        where={"id": contract_id}
    )
    
    if not contract:
        raise ValueError(f"Contract with ID {contract_id} not found")
    
    # Check ownership
    if contract.userId != user_id:
        raise ValueError("You can only delete your own contracts")
    
    # Delete contract (cascade will handle related records)
    await db.contract.delete(
        where={"id": contract_id}
    )
    
    # Delete file from storage
    try:
        if contract.filePath and os.path.exists(contract.filePath):
            os.remove(contract.filePath)
    except Exception as e:
        logger.warning(f"Failed to delete file {contract.filePath}: {e}")
    
    logger.info(f"Deleted contract: {contract_id}")
    
    return True


async def upload_contract_file(
    user_id: str,
    file_content: bytes,
    file_name: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    folder_id: Optional[str] = None,
) -> ContractUploadResponse:
    """Upload a contract file"""
    # Validate file
    if not await validate_file_type(file_name):
        raise ValueError(f"File type not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}")
    
    if not await validate_file_size(len(file_content)):
        raise ValueError(f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB")
    
    # Create contract data
    contract_data = ContractCreate(
        title=title or os.path.splitext(file_name)[0],
        description=description,
        folderId=folder_id,
        tags=[],
    )
    
    # Create contract with file
    return await create_contract(user_id, contract_data, (file_content, file_name))


async def get_contract_count(user_id: str) -> int:
    """Get the number of contracts for a user"""
    db = await get_db()
    
    count = await db.contract.count(
        where={"userId": user_id}
    )
    
    return count
