"""
Celery Tasks Module
"""

from app.tasks.celery_app import celery_app
from app.tasks.contract_analysis import analyze_contract_async

__all__ = [
    "celery_app",
    "analyze_contract_async",
]
