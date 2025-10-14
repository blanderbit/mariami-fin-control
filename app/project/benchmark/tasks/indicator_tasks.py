"""
Individual Celery tasks for each OECD indicator
"""
import logging
from celery import shared_task
from ..services.oecd_service_v2 import OECDDataService

logger = logging.getLogger(__name__)


# @shared_task(bind=True, max_retries=3)
def update_inflation_data(self):
    """Update inflation (CPI) data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_inflation()
        service._cache_indicator_data('inflation', data)
        return f"Updated inflation data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update inflation data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)  # Retry in 5 minutes


@shared_task(bind=True, max_retries=3)
def update_short_term_rate_data(self):
    """Update short-term interest rate data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_short_term_rate()
        service._cache_indicator_data('short_term_rate', data)
        return f"Updated short-term rate data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update short-term rate data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_long_term_rate_data(self):
    """Update long-term interest rate data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_long_term_rate()
        service._cache_indicator_data('long_term_rate', data)
        return f"Updated long-term rate data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update long-term rate data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_unemployment_data(self):
    """Update unemployment rate data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_unemployment()
        service._cache_indicator_data('unemployment', data)
        return f"Updated unemployment data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update unemployment data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_consumer_confidence_data(self):
    """Update consumer confidence data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_consumer_confidence()
        service._cache_indicator_data('consumer_confidence', data)
        return f"Updated consumer confidence data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update consumer confidence data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_wage_growth_data(self):
    """Update wage growth data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_wage_growth()
        service._cache_indicator_data('wage_growth', data)
        return f"Updated wage growth data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update wage growth data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_rent_index_data(self):
    """Update rent index data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_rent_index()
        service._cache_indicator_data('rent_index', data)
        return f"Updated rent index data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update rent index data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_energy_utilities_data(self):
    """Update energy & utilities price data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_energy_utilities()
        service._cache_indicator_data('energy_utilities', data)
        return f"Updated energy utilities data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update energy utilities data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def update_tax_burden_data(self):
    """Update tax burden data"""
    try:
        service = OECDDataService()
        data = service.fetch_oecd_tax_burden()
        service._cache_indicator_data('tax_burden', data)
        return f"Updated tax burden data: {len(data)} records"
    except Exception as exc:
        logger.error(f"Failed to update tax burden data: {str(exc)}")
        raise self.retry(exc=exc, countdown=300)


# Helper task to update all indicators (for manual triggers)
@shared_task
def update_all_benchmark_data():
    """Trigger all individual indicator updates"""
    tasks = [
        update_inflation_data,
        update_short_term_rate_data,
        update_long_term_rate_data,
        update_unemployment_data,
        update_consumer_confidence_data,
        update_wage_growth_data,
        update_rent_index_data,
        update_energy_utilities_data,
        update_tax_burden_data
    ]
    
    results = []
    for task in tasks:
        result = task.delay()
        results.append(f"{task.__name__}: {result.id}")
    
    return f"Triggered {len(tasks)} benchmark update tasks: {results}"