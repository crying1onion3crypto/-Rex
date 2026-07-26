"""
User Service Implementation
"""

import logging
from datetime import datetime
from typing import Optional

from prisma.models import User as PrismaUser

from app.config import settings
from app.core.security.password import get_password_hash, verify_password
from app.core.dependencies.database import get_db
from app.models.user import UserCreate, UserUpdate, UserResponse

logger = logging.getLogger(__name__)


async def create_user(user_data: UserCreate) -> UserResponse:
    """Create a new user"""
    db = await get_db()
    
    # Check if user already exists
    existing_user = await db.user.find_unique(
        where={"email": user_data.email}
    )
    
    if existing_user:
        raise ValueError(f"User with email {user_data.email} already exists")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user = await db.user.create(
        data={
            "email": user_data.email,
            "passwordHash": hashed_password,
            "firstName": user_data.firstName,
            "lastName": user_data.lastName,
            "company": user_data.company,
            "phone": user_data.phone,
            "isActive": True,
            "isVerified": False,
            "emailVerified": False,
        }
    )
    
    logger.info(f"Created new user: {user.id}")
    
    return UserResponse.model_validate(user)


async def get_user_by_id(user_id: str) -> Optional[UserResponse]:
    """Get user by ID"""
    db = await get_db()
    
    user = await db.user.find_unique(
        where={"id": user_id}
    )
    
    if user:
        return UserResponse.model_validate(user)
    return None


async def get_user_by_email(email: str) -> Optional[UserResponse]:
    """Get user by email"""
    db = await get_db()
    
    user = await db.user.find_unique(
        where={"email": email}
    )
    
    if user:
        return UserResponse.model_validate(user)
    return None


async def update_user(user_id: str, user_data: UserUpdate) -> UserResponse:
    """Update user information"""
    db = await get_db()
    
    # Get current user
    user = await db.user.find_unique(
        where={"id": user_id}
    )
    
    if not user:
        raise ValueError(f"User with ID {user_id} not found")
    
    # Prepare update data
    update_data = {}
    
    if user_data.email:
        update_data["email"] = user_data.email
    if user_data.firstName is not None:
        update_data["firstName"] = user_data.firstName
    if user_data.lastName is not None:
        update_data["lastName"] = user_data.lastName
    if user_data.company is not None:
        update_data["company"] = user_data.company
    if user_data.phone is not None:
        update_data["phone"] = user_data.phone
    
    # Handle password update
    if user_data.newPassword and user_data.currentPassword:
        # Verify current password
        if not verify_password(user_data.currentPassword, user.passwordHash):
            raise ValueError("Current password is incorrect")
        
        # Hash new password
        update_data["passwordHash"] = get_password_hash(user_data.newPassword)
    
    # Update user
    updated_user = await db.user.update(
        where={"id": user_id},
        data=update_data
    )
    
    logger.info(f"Updated user: {user_id}")
    
    return UserResponse.model_validate(updated_user)


async def delete_user(user_id: str) -> bool:
    """Delete a user"""
    db = await get_db()
    
    # Delete user
    user = await db.user.find_unique(
        where={"id": user_id}
    )
    
    if not user:
        raise ValueError(f"User with ID {user_id} not found")
    
    await db.user.delete(
        where={"id": user_id}
    )
    
    logger.info(f"Deleted user: {user_id}")
    
    return True


async def authenticate_user(email: str, password: str) -> Optional[PrismaUser]:
    """Authenticate user with email and password"""
    db = await get_db()
    
    user = await db.user.find_unique(
        where={"email": email}
    )
    
    if not user:
        return None
    
    # Verify password
    if not verify_password(password, user.passwordHash):
        return None
    
    # Check if user is active
    if not user.isActive:
        return None
    
    return user
