"""
Database Dependencies
"""

import logging
from typing import AsyncGenerator

from prisma import Prisma

from app.config import settings

logger = logging.getLogger(__name__)

# Global database client
_db: Prisma = None


async def get_db() -> Prisma:
    """Get database connection (synchronous)"""
    global _db
    
    if _db is None:
        _db = Prisma()
        await _db.connect()
        logger.info("Database connection established")
    
    return _db


async def get_async_db() -> AsyncGenerator[Prisma, None]:
    """Get database connection as async generator"""
    db = Prisma()
    await db.connect()
    
    try:
        yield db
    finally:
        await db.disconnect()


async def close_db() -> None:
    """Close database connection"""
    global _db
    
    if _db is not None:
        await _db.disconnect()
        _db = None
        logger.info("Database connection closed")


async def init_db() -> Prisma:
    """Initialize database connection"""
    db = Prisma()
    await db.connect()
    return db
