from authentication.constants.success import (
    SENT_CODE_TO_EMAIL_SUCCESS,
)
from authentication.permissions import (
    IsNotAuthenticatedPermission,
)
from authentication.serializers import (
    RequestPasswordResetSerializer,
)
from authentication.services import (
    request_reset_password_service,
)
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)

class RequestPasswordResetView(GenericAPIView):
    """
    Request password reset

    This class allows an unauthorized user to
    request a password reset. After submitting the
    application, a confirmation code will be sent
    to the email specified by the user.
    """

    serializer_class = RequestPasswordResetSerializer
    permission_classes = [
        IsNotAuthenticatedPermission,
    ]

    def post(self, request: Request) -> Response:
        email: str = request.data.get("email", "")
        request_reset_password_service(user_email=email)
        return Response(SENT_CODE_TO_EMAIL_SUCCESS, status=HTTP_200_OK)