"""
Celery Application Configuration
"""

import logging
from celery import Celery

from app.config import settings

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "contract_ai_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Configure Celery
celery_app.conf.update(
    task_serializer=settings.CELERY_TASK_SERIALIZER,
    result_serializer=settings.CELERY_RESULT_SERIALIZER,
    accept_content=settings.CELERY_ACCEPT_CONTENT,
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,  # 1 hour
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
)

# Configure logging
celery_app.conf.update(
    worker_log_format="[%(asctime)s: %(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s",
    worker_log_level=settings.LOG_LEVEL,
)

# Import tasks to register them
from app.tasks.contract_analysis import analyze_contract_async
