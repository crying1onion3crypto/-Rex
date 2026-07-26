"""
Tag Endpoints
"""

import logging
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.core.security import get_current_active_user
from app.models.user import UserResponse
from app.models.tag import TagCreate, TagUpdate, TagResponse
from app.core.dependencies.database import get_db

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/tags")


@router.post("/", response_model=TagResponse)
async def create_tag(
    tag_data: TagCreate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Create a new tag"""
    try:
        db = await get_db()
        
        # Check if tag already exists for this user
        existing_tag = await db.tag.find_first(
            where={
                "userId": current_user.id,
                "name": tag_data.name,
            }
        )
        
        if existing_tag:
            raise ValueError(f"Tag with name '{tag_data.name}' already exists")
        
        # Create tag
        tag = await db.tag.create(
            data={
                "userId": current_user.id,
                "name": tag_data.name,
                "color": tag_data.color,
                "description": tag_data.description,
            }
        )
        
        logger.info(f"User {current_user.id} created tag: {tag.id}")
        
        return TagResponse(
            id=tag.id,
            userId=tag.userId,
            name=tag.name,
            color=tag.color,
            description=tag.description,
            createdAt=tag.createdAt,
            contractCount=0,
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Failed to create tag: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tag",
        )


@router.get("/", response_model=List[TagResponse])
async def list_tags(
    search: Optional[str] = Query(None),
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """List all tags for the current user"""
    try:
        db = await get_db()
        
        # Build where clause
        where = {"userId": current_user.id}
        
        if search:
            where["name"] = {"contains": search}
        
        # Get tags
        tags = await db.tag.find_many(
            where=where,
            order_by={"name": "asc"}
        )
        
        # Get contract counts for each tag
        tag_responses = []
        for tag in tags:
            contract_count = await db.contracttag.count(
                where={"tagId": tag.id}
            )
            
            tag_responses.append(
                TagResponse(
                    id=tag.id,
                    userId=tag.userId,
                    name=tag.name,
                    color=tag.color,
                    description=tag.description,
                    createdAt=tag.createdAt,
                    contractCount=contract_count,
                )
            )
        
        return tag_responses
        
    except Exception as e:
        logger.error(f"Failed to list tags: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list tags",
        )


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Get a specific tag"""
    try:
        db = await get_db()
        
        tag = await db.tag.find_unique(
            where={"id": tag_id}
        )
        
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found",
            )
        
        if tag.userId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tag does not belong to you",
            )
        
        # Get contract count
        contract_count = await db.contracttag.count(
            where={"tagId": tag.id}
        )
        
        return TagResponse(
            id=tag.id,
            userId=tag.userId,
            name=tag.name,
            color=tag.color,
            description=tag.description,
            createdAt=tag.createdAt,
            contractCount=contract_count,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tag {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tag",
        )


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: str,
    tag_data: TagUpdate,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Update a tag"""
    try:
        db = await get_db()
        
        tag = await db.tag.find_unique(
            where={"id": tag_id}
        )
        
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found",
            )
        
        if tag.userId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tag does not belong to you",
            )
        
        # Prepare update data
        update_data = {}
        
        if tag_data.name is not None:
            # Check if new name already exists
            existing_tag = await db.tag.find_first(
                where={
                    "userId": current_user.id,
                    "name": tag_data.name,
                }
            )
            if existing_tag and existing_tag.id != tag_id:
                raise ValueError(f"Tag with name '{tag_data.name}' already exists")
            update_data["name"] = tag_data.name
        
        if tag_data.color is not None:
            update_data["color"] = tag_data.color
        
        if tag_data.description is not None:
            update_data["description"] = tag_data.description
        
        # Update tag
        updated_tag = await db.tag.update(
            where={"id": tag_id},
            data=update_data
        )
        
        logger.info(f"User {current_user.id} updated tag: {tag_id}")
        
        # Get contract count
        contract_count = await db.contracttag.count(
            where={"tagId": updated_tag.id}
        )
        
        return TagResponse(
            id=updated_tag.id,
            userId=updated_tag.userId,
            name=updated_tag.name,
            color=updated_tag.color,
            description=updated_tag.description,
            createdAt=updated_tag.createdAt,
            contractCount=contract_count,
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update tag {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tag",
        )


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_active_user)],
):
    """Delete a tag"""
    try:
        db = await get_db()
        
        tag = await db.tag.find_unique(
            where={"id": tag_id}
        )
        
        if not tag:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found",
            )
        
        if tag.userId != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tag does not belong to you",
            )
        
        # Delete tag (cascade will handle ContractTag records)
        await db.tag.delete(
            where={"id": tag_id}
        )
        
        logger.info(f"User {current_user.id} deleted tag: {tag_id}")
        
        return {"message": "Tag deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete tag {tag_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete tag",
        )
