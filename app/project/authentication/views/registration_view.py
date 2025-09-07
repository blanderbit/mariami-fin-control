from authentication.permissions import (
    IsNotAuthenticatedPermission,
)
from users.models import UserModel
from authentication.serializers import RegistrationSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
)


class RegistrationView(GenericAPIView):
    """
    Registration
    This endpoint allows any user 
    to register on the site.
    """

    serializer_class = RegistrationSerializer
    permission_classes = [
        IsNotAuthenticatedPermission,
    ]

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user: UserModel = serializer.save()
        return Response(user.tokens(), status=HTTP_201_CREATED)
