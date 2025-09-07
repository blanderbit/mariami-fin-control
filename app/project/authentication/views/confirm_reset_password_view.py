from authentication.constants.success import (
    PASSWORD_RESET_SUCCESS,
)
from authentication.permissions import (
    IsNotAuthenticatedPermission,
)
from authentication.serializers import (
    ResetPasswordSerializer,
)
from authentication.services import (
    reset_password_service,
)
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)


class ConfirmResetPassword(GenericAPIView):
    """
    Confirm password reset

    This class makes it possible to confirm a password
    reset request using the code that was sent to the
    mail after the request was sent.
    """

    serializer_class = ResetPasswordSerializer
    permission_classes = [
        IsNotAuthenticatedPermission,
    ]

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        reset_password_service(
            verify_code=serializer.validated_data["verify_code"],
            new_password=serializer.validated_data["new_password"],
        )
        return Response(PASSWORD_RESET_SUCCESS, status=HTTP_200_OK)
