from authentication.constants.success import (
    RESET_PASSWORD_CODE_IS_VALID_SUCCESS,
)
from authentication.permissions import (
    IsNotAuthenticatedPermission
)
from authentication.serializers import (
    ValidateResetPasswordCodeSerializer,
)
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)

class ValidateResetPasswordCodeView(GenericAPIView):
    """
    Validate reset password code

    This endpoint allows the user to check the password reset code for
    validity before using it
    """

    serializer_class = ValidateResetPasswordCodeSerializer
    permission_classes = [
        IsNotAuthenticatedPermission,
    ]

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(RESET_PASSWORD_CODE_IS_VALID_SUCCESS, HTTP_200_OK)