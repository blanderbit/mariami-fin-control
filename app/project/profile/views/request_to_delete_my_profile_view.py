from authentication.services import (
    create_verify_code_service,
)
from authentication.constants.code_types import (
    ACCOUNT_DELETE_CODE_TYPE,
)
from authentication.constants.success import (
    SENT_CODE_TO_EMAIL_SUCCESS,
)
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK


class RequestToDeleteMyProfileView(GenericAPIView):
    """
    Request delete profile

    This endpoint allows the user to send a
    request to delete their account.
    """

    def delete(self, request: Request) -> Response:
        create_verify_code_service(
            email=request.user.email,
            type=ACCOUNT_DELETE_CODE_TYPE,
            dop_info={"email": request.user.email},
        )
        return Response(SENT_CODE_TO_EMAIL_SUCCESS, status=HTTP_200_OK)
