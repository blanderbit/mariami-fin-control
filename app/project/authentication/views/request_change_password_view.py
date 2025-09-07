from authentication.constants.errors import (
    WRONG_PASSWORD_ERROR,
)
from authentication.constants.success import (
    SENT_CODE_TO_EMAIL_SUCCESS,
)
from authentication.serializers import (
    RequestChangePasswordSerializer,
)
from authentication.services.request_change_password_service import (
    request_change_password_service,
)
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
)


class RequestChangePasswordView(GenericAPIView):
    """
    Request change password

    This class allows an authorized user to request a password change.
    After submitting the application, a confirmation code will be sent.
    to the email address provided by the user.
    """

    serializer_class = RequestChangePasswordSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.data.get("old_password")):
            return Response(WRONG_PASSWORD_ERROR, status=HTTP_400_BAD_REQUEST)
        request_change_password_service(
            email=request.user.email,
            new_password=serializer.validated_data["new_password"],
        )
        return Response(SENT_CODE_TO_EMAIL_SUCCESS, status=HTTP_200_OK)
