from authentication.models import VerifyCodeModel
from config.celery import celery


@celery.task
def delete_expire_verify_codes() -> None:
    VerifyCodeModel.get_only_expired().delete()
