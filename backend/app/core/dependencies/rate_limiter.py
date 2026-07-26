"""
Rate Limiting Dependencies
"""

import logging
from typing import Callable, Optional
from functools import wraps

from fastapi import Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings

logger = logging.getLogger(__name__)

# Create rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_REQUESTS}/{settings.RATE_LIMIT_WINDOW_SECONDS}seconds"]
)


def rate_limiter(
    limit: str = None,
    key_func: Callable = None
):
    """Rate limiter decorator"""
    if limit:
        return limiter.limit(limit, key_func=key_func)
    return limiter.limit(f"{settings.RATE_LIMIT_REQUESTS}/{settings.RATE_LIMIT_WINDOW_SECONDS}seconds", key_func=key_func)


async def check_rate_limit(request: Request) -> None:
    """Check rate limit for request"""
    try:
        await limiter.check(request)
    except RateLimitExceeded:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )
