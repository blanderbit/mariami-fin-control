import threading
from typing import Any
from config.celery import celery
from django.core.mail import EmailMessage
from users.models import UserModel
from django.template.loader import (
    render_to_string,
)
from django.utils import timezone


class EmailThread(threading.Thread):
    def __init__(self, email: str) -> None:
        self.email: str = email
        threading.Thread.__init__(self)

    def run(self) -> None:
        self.email.send()


class EmailThread(threading.Thread):
    def __init__(self, email: str) -> None:
        self.email: str = email
        threading.Thread.__init__(self)

    def run(self) -> None:
        self.email.send()


class Util:
    @staticmethod
    @celery.task(
        ignore_result=True,
        time_limit=5,
        soft_time_limit=3,
        default_retry_delay=5,
    )
    def send_email(*, data: dict[str, Any]) -> None:
        send: EmailMessage = EmailMessage(
            subject="MariaMi", body=data["email_body"], to=[data["to_email"]]
        )
        send.content_subtype = "html"
        EmailThread(send).start()


def send_email_template_service(
    *, user: UserModel, body_title: str, title: str, text: str
) -> None:
    """send html template to email"""
    context = {
        "date_time": timezone.now(),
        "body_title": body_title,
        "title": title,
        "text": text,
    }
    message: str = render_to_string("email_confirm.html", context)
    Util.send_email.delay(data={"email_body": message, "to_email": user.email})
