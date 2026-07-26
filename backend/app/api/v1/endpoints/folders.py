"""
Folder Endpoints
"""

import logging
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.security import get_current_active_user
from app.models.user import UserResponse
from app.models.folder import FolderCreate, FolderUpdate, FolderResponse
from app.services.contract import get_user_contracts
from app.core.dependencies.database import get_db

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/folders")


@router.post("/", response_model=FolderResponse)
async def create_folder(
    folder_data: FolderCreate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create a new folder"""
    try:
        db = await get_db()
        
        # Validate parent folder if specified
        if folder_data.parentId:
            parent_folder = await db.folder.find_unique(
                where={"id": folder_data.parentId}
            )
            if not parent_folder:
                raise ValueError(f"Parent folder with ID {folder_data.parentId} not found")
            if parent_folder.userId != current_user.id:
                raise ValueError("Parent folder does not belong to you")
        
        # Create folder
        folder = await db.folder.create(
            data={
                "userId": current_user.id,
                "name": folder_data.name,
                "description": folder_data.description,
                "color": folder_data.color,
                "parentId": folder_data.parentId,
                "order": folder_data.order,
                "isPublic": False,
            }
        )
        
        logger.info(f"User {current_user.id} created folder: {folder.id}")
        
        return FolderResponse(
            id=folder.id,
            userId=folder.userId,
            name=folder.name,
            description=folder.description,
            color=folder.color,
            parentId=folder.parentId,
            order=folder.order,
            isPublic=folder.isPublic,
            createdAt=folder.createdAt,
            updatedAt=folder.updatedAt,
            contractCount=0,
            children=[],
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to create folder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create folder",
        )


@router.get("/", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[str] = Query(None),
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """List all folders for the current user"""
    try:
        db = await get_db()
        
        # Get folders
        if parent_id:
            folders = await db.folder.find_many(
                where={
                    "userId": current_user.id,
                    "parentId": parent_id,
                },
                order_by={"order": "asc"}
            )
        else:
            folders = await db.folder.find_many(
                where={
                    "userId": current_user.id,
                    "parentId": None,
                },
                order_by={"order": "asc"}
            )
        
        # Get contract counts and children for each folder
        folder_responses = []
        for folder in folders:
            # Get contract count
            contract_count = await db.contract.count(
                where={"folderId": folder.id}
            )
            
            # Get children (if not already getting for a specific parent)
            children = []
            if not parent_id:
                children_folders = await db.folder.find_many(
                    where={"parentId": folder.id},
                    order_by={"order": "asc"}
                )
                for child_folder in children_folders:
                    child_contract_count = await db.contract.count(
                        where={"folderId": child_folder.id}
                    )
                    children.append(
                        FolderResponse(
                            id=child_folder.id,
                            userId=child_folder.userId,
                            name=child_folder.name,
                            description=child_folder.description,
                            color=child_folder.color,
                            parentId=child_folder.parentId,
                            order=child_folder.order,
                            isPublic=child_folder.isPublic,
                            createdAt=child_folder.createdAt,
                            updatedAt=child_folder.updatedAt,
                            contractCount=child_contract_count,
                            children=[],
                        )
                    )
            
            folder_responses.append(
                FolderResponse(
                    id=folder.id,
                    userId=folder.userId,
                    name=folder.name,
                    description=folder.description,
                    color=folder.color,
                    parentId=folder.parentId,
                    order=folder.order,
                    isPublic=folder.isPublic,
                    createdAt=folder.createdAt,
                    updatedAt=folder.updatedAt,
                    contractCount=contract_count,
                    children=children,
                )
            )
        
        return folder_responses
        
    except Exception as e:
        logger.error(f"Failed to list folders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list folders",
        )


@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get a specific folder"""
    try:
        db = await get_db()
        
        folder = await db.folder.find_unique(
            where={"id": folder_id}
        )
        
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found",
            )
        
        if folder.userId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Folder does not belong to you",
            )
        
        # Get contract count
        contract_count = await db.contract.count(
            where={"folderId": folder.id}
        )
        
        # Get children
        children_folders = await db.folder.find_many(
            where={"parentId": folder.id},
            order_by={"order": "asc"}
        )
        
        children = []
        for child_folder in children_folders:
            child_contract_count = await db.contract.count(
                where={"folderId": child_folder.id}
            )
            children.append(
                FolderResponse(
                    id=child_folder.id,
                    userId=child_folder.userId,
                    name=child_folder.name,
                    description=child_folder.description,
                    color=child_folder.color,
                    parentId=child_folder.parentId,
                    order=child_folder.order,
                    isPublic=child_folder.isPublic,
                    createdAt=child_folder.createdAt,
                    updatedAt=child_folder.updatedAt,
                    contractCount=child_contract_count,
                    children=[],
                )
            )
        
        return FolderResponse(
            id=folder.id,
            userId=folder.userId,
            name=folder.name,
            description=folder.description,
            color=folder.color,
            parentId=folder.parentId,
            order=folder.order,
            isPublic=folder.isPublic,
            createdAt=folder.createdAt,
            updatedAt=folder.updatedAt,
            contractCount=contract_count,
            children=children,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get folder {folder_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get folder",
        )


@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(
    folder_id: str,
    folder_data: FolderUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Update a folder"""
    try:
        db = await get_db()
        
        folder = await db.folder.find_unique(
            where={"id": folder_id}
        )
        
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found",
            )
        
        if folder.userId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Folder does not belong to you",
            )
        
        # Prepare update data
        update_data = {}
        
        if folder_data.name is not None:
            update_data["name"] = folder_data.name
        if folder_data.description is not None:
            update_data["description"] = folder_data.description
        if folder_data.color is not None:
            update_data["color"] = folder_data.color
        if folder_data.parentId is not None:
            # Validate parent folder
            if folder_data.parentId != "":
                parent_folder = await db.folder.find_unique(
                    where={"id": folder_data.parentId}
                )
                if not parent_folder:
                    raise ValueError(f"Parent folder with ID {folder_data.parentId} not found")
                if parent_folder.userId != current_user.id:
                    raise ValueError("Parent folder does not belong to you")
            update_data["parentId"] = folder_data.parentId if folder_data.parentId != "" else None
        if folder_data.order is not None:
            update_data["order"] = folder_data.order
        
        # Update folder
        updated_folder = await db.folder.update(
            where={"id": folder_id},
            data=update_data
        )
        
        logger.info(f"User {current_user.id} updated folder: {folder_id}")
        
        # Get contract count
        contract_count = await db.contract.count(
            where={"folderId": updated_folder.id}
        )
        
        return FolderResponse(
            id=updated_folder.id,
            userId=updated_folder.userId,
            name=updated_folder.name,
            description=updated_folder.description,
            color=updated_folder.color,
            parentId=updated_folder.parentId,
            order=updated_folder.order,
            isPublic=updated_folder.isPublic,
            createdAt=updated_folder.createdAt,
            updatedAt=updated_folder.updatedAt,
            contractCount=contract_count,
            children=[],
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update folder {folder_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update folder",
        )


@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Delete a folder"""
    try:
        db = await get_db()
        
        folder = await db.folder.find_unique(
            where={"id": folder_id}
        )
        
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found",
            )
        
        if folder.userId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Folder does not belong to you",
            )
        
        # Check if folder has contracts or subfolders
        contract_count = await db.contract.count(
            where={"folderId": folder_id}
        )
        
        if contract_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete folder with contracts. Move contracts to another folder first.",
            )
        
        subfolder_count = await db.folder.count(
            where={"parentId": folder_id}
        )
        
        if subfolder_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete folder with subfolders. Move subfolders to another folder first.",
            )
        
        # Delete folder
        await db.folder.delete(
            where={"id": folder_id}
        )
        
        logger.info(f"User {current_user.id} deleted folder: {folder_id}")
        
        return {"message": "Folder deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete folder {folder_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete folder",
        )
