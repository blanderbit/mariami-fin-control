from authentication.constants.success import (
    ACTIVATION_SUCCESS,
    EMAIL_VERIFY_SUCCESS_BODY_TITLE,
    EMAIL_VERIFY_SUCCESS_TEXT,
    EMAIL_VERIFY_SUCCESS_TITLE,
)
from authentication.models import VerifyCodeModel
from users.models import UserModel
from authentication.services.send_email_service import (
    send_email_template_service,
)
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)

def verify_email_service(*, user: UserModel, confirm_code: VerifyCodeModel) -> Response:
    user.is_verified = True
    user.save()
    confirm_code.delete()
    send_email_template_service(
        user=user,
        body_title=EMAIL_VERIFY_SUCCESS_BODY_TITLE,
        title=EMAIL_VERIFY_SUCCESS_TITLE,
        text=EMAIL_VERIFY_SUCCESS_TEXT,
    )
    return Response(ACTIVATION_SUCCESS, status=HTTP_200_OK)
