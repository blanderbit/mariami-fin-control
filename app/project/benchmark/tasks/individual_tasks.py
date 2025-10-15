"""
Individual Celery tasks for each benchmark indicator
"""
import logging
from celery import shared_task
from typing import List, Dict, Any

from ..services.oecd_functions import (
    fetch_oecd_inflation,
    fetch_oecd_short_term_rate,
    fetch_oecd_long_term_rate,
    fetch_oecd_consumer_confidence,
    fetch_oecd_wage_growth,
    fetch_oecd_rent_index,
    fetch_oecd_energy_utilities,
    fetch_oecd_tax_burden,
    get_cached_indicator_data
)

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=0)
def fetch_inflation_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch inflation data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('inflation')
        if cached_data:
            logger.info("Returning cached inflation data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh inflation data from OECD")
        data = fetch_oecd_inflation()
        
        if not data:
            raise Exception("Failed to fetch inflation data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Inflation task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_short_term_rate_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch short-term interest rate data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('short_term_rate')
        if cached_data:
            logger.info("Returning cached short-term rate data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh short-term rate data from OECD")
        data = fetch_oecd_short_term_rate()
        
        if not data:
            raise Exception("Failed to fetch short-term rate data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Short-term rate task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_long_term_rate_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch long-term interest rate data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('long_term_rate')
        if cached_data:
            logger.info("Returning cached long-term rate data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh long-term rate data from OECD")
        data = fetch_oecd_long_term_rate()
        
        if not data:
            raise Exception("Failed to fetch long-term rate data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Long-term rate task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_consumer_confidence_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch consumer confidence data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('consumer_confidence')
        if cached_data:
            logger.info("Returning cached consumer confidence data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh consumer confidence data from OECD")
        data = fetch_oecd_consumer_confidence()
        
        if not data:
            raise Exception("Failed to fetch consumer confidence data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Consumer confidence task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_wage_growth_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch wage growth data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('wage_growth')
        if cached_data:
            logger.info("Returning cached wage growth data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh wage growth data from OECD")
        data = fetch_oecd_wage_growth()
        
        if not data:
            raise Exception("Failed to fetch wage growth data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Wage growth task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_rent_index_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch rent index data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('rent_index')
        if cached_data:
            logger.info("Returning cached rent index data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh rent index data from OECD")
        data = fetch_oecd_rent_index()
        
        if not data:
            raise Exception("Failed to fetch rent index data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Rent index task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_energy_utilities_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch energy & utilities data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('energy_utilities')
        if cached_data:
            logger.info("Returning cached energy utilities data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh energy utilities data from OECD")
        data = fetch_oecd_energy_utilities()
        
        if not data:
            raise Exception("Failed to fetch energy utilities data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Energy utilities task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=1)
def fetch_tax_burden_task(self) -> List[Dict[str, Any]]:
    """
    Celery task to fetch tax burden data
    
    Returns cached data if available, otherwise fetches from OECD API
    """
    try:
        # Check cache first
        cached_data = get_cached_indicator_data('tax_burden')
        if cached_data:
            logger.info("Returning cached tax burden data")
            return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh tax burden data from OECD")
        data = fetch_oecd_tax_burden()
        
        if not data:
            raise Exception("Failed to fetch tax burden data")
        
        return data
        
    except Exception as exc:
        logger.error(f"Tax burden task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))