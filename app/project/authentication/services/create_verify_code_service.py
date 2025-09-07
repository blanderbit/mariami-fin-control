from random import choices as random_choices
from string import ascii_uppercase as string_ascii_uppercase
from authentication.models import VerifyCodeModel
from users.models import UserModel
from authentication.services import Util
from django.conf import settings
from django.template.loader import (
    render_to_string,
)
from django.utils import timezone
from authentication.constants.code_types import (
    ACCOUNT_DELETE_CODE_TYPE,
    EMAIL_CHANGE_CODE_TYPE,
    EMAIL_VERIFY_CODE_TYPE,
    PASSWORD_CHANGE_CODE_TYPE,
    PASSWORD_RESET_CODE_TYPE
)
from authentication.constants.success import EMAIL_MESSAGE_TEMPLATE_TITLE


def check_code_type(*, code: VerifyCodeModel) -> str:
    if code.type == EMAIL_CHANGE_CODE_TYPE:
        title = EMAIL_MESSAGE_TEMPLATE_TITLE.format(type="Change", key="email address")
    elif code.type == ACCOUNT_DELETE_CODE_TYPE:
        title = EMAIL_MESSAGE_TEMPLATE_TITLE.format(type="Removal", key="account")
    elif code.type == EMAIL_VERIFY_CODE_TYPE:
        title = EMAIL_MESSAGE_TEMPLATE_TITLE.format(
            type="Confirmation", key="email address"
        )
    elif code.type in (PASSWORD_CHANGE_CODE_TYPE, PASSWORD_RESET_CODE_TYPE):
        title = EMAIL_MESSAGE_TEMPLATE_TITLE.format(type="Change", key="password")
    return title


def create_verify_code_service(*, email: str, type: str, dop_info: dict) -> None:
    verify_code: str = "".join(
        random_choices(
            string_ascii_uppercase,
            k=VerifyCodeModel._meta.get_field("verify_code").max_length,
        )
    )
    code: VerifyCodeModel = VerifyCodeModel.objects.create(
        dop_info=dop_info,
        verify_code=verify_code,
        user_email=email,
        type=type,
        life_time=timezone.now()
        + timezone.timedelta(minutes=settings.CODE_EXPIRE_MINUTES_TIME),
    )
    user: UserModel = UserModel.objects.get(email=email)
    context: dict = {
        "title": check_code_type(code=code),
        "code": code.verify_code,
        "email": user.email,
    }
    template: str = render_to_string("email_code.html", context)
    Util.send_email.delay(data={"email_body": template, "to_email": email})
