from authentication.constants.code_types import (
    PASSWORD_CHANGE_CODE_TYPE,
)
from authentication.constants.success import (
    CHANGE_PASSWORD_SUCCESS,
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
from rest_framework.status import (
    HTTP_200_OK,
)


def change_password_serivce(
    *, user: UserModel, confirm_code: VerifyCodeModel
) -> Response:
    user.set_password(confirm_code.dop_info["password"])
    send_email_template_service(
        user=user,
        body_title=TEMPLATE_SUCCESS_BODY_TITLE.format(key="password"),
        title=TEMPLATE_SUCCESS_TITLE.format(key="password"),
        text=TEMPLATE_SUCCESS_TEXT.format(key="password"),
    )
    return Response(CHANGE_PASSWORD_SUCCESS, status=HTTP_200_OK)