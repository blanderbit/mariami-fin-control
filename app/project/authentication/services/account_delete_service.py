from authentication.constants.success import (
    ACCOUNT_DELETE_SUCCESS_BODY_TITLE,
    ACCOUNT_DELETE_SUCCESS_TEXT,
    ACCOUNT_DELETE_SUCCESS_TITLE,
    ACCOUNT_DELETED_SUCCESS,
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


def account_delete_service(
    *, user: UserModel, confirm_code: VerifyCodeModel
) -> Response:
    send_email_template_service(
        user=user,
        body_title=ACCOUNT_DELETE_SUCCESS_BODY_TITLE,
        title=ACCOUNT_DELETE_SUCCESS_TITLE,
        text=ACCOUNT_DELETE_SUCCESS_TEXT,
    )
    user.delete()
    confirm_code.delete()
    return Response(ACCOUNT_DELETED_SUCCESS, status=HTTP_200_OK)
