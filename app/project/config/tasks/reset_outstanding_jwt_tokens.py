from config.celery import celery
from django.core.management import call_command


@celery.task
def reset_outstanding_jwt_tokens() -> None:
    call_command("flushexpiredtokens")
