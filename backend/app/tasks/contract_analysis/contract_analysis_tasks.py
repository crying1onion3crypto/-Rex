"""
Contract Analysis Celery Tasks
"""

import logging
import time
from celery import shared_task
from celery.exceptions import Retry

from app.config import settings
from app.core.dependencies.database import get_db
from app.models.contract import ContractStatus
from app.services.analysis import analyze_contract
from app.services.contract import get_contract_by_id
from app.services.subscription import increment_contract_count

logger = logging.getLogger(__name__)


@shared_task(
    name="analyze_contract_async",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def analyze_contract_async(self, contract_id: str, user_id: str, focus_areas: list = None, custom_prompt: str = None):
    """Async task to analyze a contract"""
    
    try:
        logger.info(f"Starting async analysis for contract {contract_id}")
        
        # Update contract status to processing
        db = get_db()
        db.contract.update(
            where={"id": contract_id},
            data={"status": ContractStatus.PROCESSING}
        )
        
        # Perform analysis
        start_time = time.time()
        
        analysis = analyze_contract(
            contract_id=contract_id,
            user_id=user_id,
            focus_areas=focus_areas,
            custom_prompt=custom_prompt,
        )
        
        processing_time = time.time() - start_time
        
        logger.info(f"Completed async analysis for contract {contract_id} in {processing_time:.2f}s")
        
        # Increment contract count
        increment_contract_count(user_id)
        
        return {
            "status": "success",
            "contract_id": contract_id,
            "processing_time": processing_time,
            "analysis_id": analysis.id,
        }
        
    except Exception as e:
        logger.error(f"Async analysis failed for contract {contract_id}: {e}")
        
        # Update contract status to failed
        try:
            db = get_db()
            db.contract.update(
                where={"id": contract_id},
                data={
                    "status": ContractStatus.FAILED,
                    "processingError": str(e),
                }
            )
        except Exception as db_error:
            logger.error(f"Failed to update contract status: {db_error}")
        
        # Retry if it's a temporary error
        if "rate limit" in str(e).lower() or "timeout" in str(e).lower():
            raise Retry(exc=e, countdown=60)
        
        raise
