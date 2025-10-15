from decouple import config
from celery.schedules import crontab


CELERY_BROKER_URL: str = config("CELERY_BROKER_URL", cast=str)
CELERY_RESULT_BACKEND: str = config("CELERY_RESULT_BACKEND", cast=str)
CELERY_TASK_SERIALIZER: str = "json"
CELERY_RESULT_SERIALIZER: str = "json"
CELERY_ACKS_LATE: bool = True
CELERY_PREFETCH_MULTIPLIER: int = 1
CELERY_ACCEPT_CONTENT: list[str] = ["application/json"]
CELERY_TASK_RESULT_EXPIRES: int = 10 * 60
CELERY_TASK_TIME_LIMIT: int = 8 * 60 * 60  # 8 hours
CELERY_TASK_SOFT_TIME_LIMIT: int = 10 * 60 * 60  # 10 hours
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP: bool = True

CELERY_TIMEZONE = 'UTC'

# Celery Beat configuration for individual indicator tasks
# Each task runs at different times to avoid rate limiting
CELERY_BEAT_SCHEDULE = {
    # 'update-inflation-data': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_inflation_data',
    #     'schedule': crontab(hour=1, minute=0),  # Daily at 1:00 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-short-term-rate': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_short_term_rate_data',
    #     'schedule': crontab(hour=1, minute=15),  # Daily at 1:15 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-long-term-rate': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_long_term_rate_data',
    #     'schedule': crontab(hour=1, minute=30),  # Daily at 1:30 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-unemployment-data': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_unemployment_data',
    #     'schedule': crontab(hour=1, minute=45),  # Daily at 1:45 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-consumer-confidence': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_consumer_confidence_data',
    #     'schedule': crontab(hour=2, minute=0),  # Daily at 2:00 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-wage-growth': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_wage_growth_data',
    #     'schedule': crontab(hour=2, minute=15),  # Daily at 2:15 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-rent-index': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_rent_index_data',
    #     'schedule': crontab(hour=2, minute=30),  # Daily at 2:30 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-energy-utilities': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_energy_utilities_data',
    #     'schedule': crontab(hour=2, minute=45),  # Daily at 2:45 AM
    #     'options': {'expires': 3600}
    # },
    # 'update-tax-burden': {
    #     'task': 'benchmark.tasks.indicator_tasks.update_tax_burden_data',
    #     'schedule': crontab(hour=3, minute=0),  # Daily at 3:00 AM
    #     'options': {'expires': 3600}
    # },
}
