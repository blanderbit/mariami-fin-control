from typing import Optional
from authentication.constants.errors import (
    NO_PERMISSIONS_ERROR,
)
from authentication.constants.success import (
    CHANGE_EMAIL_SUCCESS,
    TEMPLATE_SUCCESS_BODY_TITLE,
    TEMPLATE_SUCCESS_TEXT,
    TEMPLATE_SUCCESS_TITLE,
)
from authentication.models import VerifyCodeModel
from users.models import UserModel
from authentication.services.send_email_service import (
    send_email_template_service,
)
from rest_framework.response import Response
from rest_framework.serializers import (
    ValidationError,
)
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
)


def change_email_service(*, user: UserModel, confirm_code: VerifyCodeModel) -> Optional[Response]:
    if confirm_code.user_email != user.email:
        raise ValidationError(NO_PERMISSIONS_ERROR, HTTP_400_BAD_REQUEST)

    user.email = confirm_code.dop_info["email"]
    user.is_verified = False
    send_email_template_service(
        user=user,
        body_title=TEMPLATE_SUCCESS_BODY_TITLE.format(key="email"),
        title=TEMPLATE_SUCCESS_TITLE.format(key="email"),
        text=TEMPLATE_SUCCESS_TEXT.format(key="email"),
    )
    return Response(CHANGE_EMAIL_SUCCESS, status=HTTP_200_OK)