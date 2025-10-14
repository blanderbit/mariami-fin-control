"""
Celery tasks for benchmark data management
"""
import logging
from celery import shared_task
from ..services.oecd_service import OECDDataService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def update_benchmark_data(self):
    """
    Celery task to update all benchmark data from OECD API
    
    This task runs daily via Celery Beat to keep benchmark data current.
    It also runs on application startup to ensure data availability.
    """
    try:
        logger.info("Starting benchmark data update task")
        
        # Initialize OECD service
        oecd_service = OECDDataService()
        
        # Update all benchmark data
        success = oecd_service.update_all_benchmark_data()
        
        if success:
            logger.info("Benchmark data update task completed successfully")
            return "Benchmark data updated successfully"
        else:
            logger.error("Benchmark data update task failed")
            raise Exception("Failed to update benchmark data")
            
    except Exception as exc:
        logger.error(f"Benchmark data update task failed: {str(exc)}")
        # Retry the task with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task
def update_single_indicator(indicator_key: str):
    """
    Update data for a single economic indicator
    
    Args:
        indicator_key: The key of the indicator to update
    """
    try:
        logger.info(f"Updating single indicator: {indicator_key}")
        
        oecd_service = OECDDataService()
        indicator_data = oecd_service.fetch_indicator_data(indicator_key)
        
        # Store only this indicator's data
        oecd_service.store_data_in_cache({indicator_key: indicator_data})
        
        logger.info(f"Successfully updated indicator: {indicator_key}")
        return f"Indicator {indicator_key} updated successfully"
        
    except Exception as exc:
        logger.error(f"Failed to update indicator {indicator_key}: {str(exc)}")
        raise exc