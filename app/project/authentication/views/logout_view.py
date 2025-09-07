from authentication.constants.success import (
    LOGOUT_SUCCESS,
)
from authentication.services import (
    logout_service,
)
from authentication.serializers import LogoutSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)


class LogoutView(GenericAPIView):
    """
    Logout

    This endpoint allows a previously
    registered user to logout from the system
    """

    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        logout_service(serializer.validated_data["refresh"])
        return Response(LOGOUT_SUCCESS, status=HTTP_200_OK)
