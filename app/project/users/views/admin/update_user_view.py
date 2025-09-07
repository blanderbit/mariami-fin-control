from typing import Any
from users.models import UserModel
from authentication.permissions import (
    IsUserAdminPermission
)
from users.serializers import (
    UpdateUserSerializer,
)
from users.services import (
    update_user_service,
)
from django.db.models.query import QuerySet
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK


class UpdateUserView(GenericAPIView):
    """
    Update profile

    This class allows an authorized
    user to change their profile information.
    """

    serializer_class = UpdateUserSerializer
    permission_classes = [
        IsUserAdminPermission,
    ]

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        result: dict[str, Any] = update_user_service(
            user_id=serializer.validated_data["user_id"], 
            new_data=serializer.validated_data["new_data"],
        )
        return Response(result, status=HTTP_200_OK)