from authentication.permissions import (
    IsNotAuthenticatedPermission,
)
from authentication.serializers import LoginSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)


class LoginView(GenericAPIView):
    """
    Login

    This endpoint allows a previously
    registered user to log in to the system.
    """

    serializer_class = LoginSerializer
    permission_classes = [
        IsNotAuthenticatedPermission,
    ]

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=HTTP_200_OK)
