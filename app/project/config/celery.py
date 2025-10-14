import os

from celery import Celery, chain
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

celery = Celery("config")

celery.config_from_object("django.conf:settings", namespace="CELERY")
celery.autodiscover_tasks()


celery.conf.beat_schedule = {
    "delete_expire_verify_codes": {
        "task": "authentication.tasks.delete_expire_verify_codes.delete_expire_verify_codes",
        "schedule": crontab(minute="*/10"),
    },
    "reset_outstanding_jwt_tokens": {
        "task": "config.tasks.reset_outstanding_jwt_tokens.reset_outstanding_jwt_tokens",
        "schedule": crontab(minute=0, hour=0),
    },
}
