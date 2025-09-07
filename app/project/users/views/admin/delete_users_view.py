from users.models import UserModel
from users.services import (
    delete_users_service,
)
from authentication.permissions import (
    IsUserAdminPermission
)
from config.serializers import BaseBulkSerializer
from config.types import BULK_RESPONSE
from django.db.models.query import QuerySet
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)


class DeleteUsersView(GenericAPIView):
    """
    Delete users

    This endpoint allows the admin to delete users.
    If the admin deletes the user,
    it can no longer be restored.
    """

    serializer_class = BaseBulkSerializer
    queryset: QuerySet[UserModel] = UserModel.get_all()
    permission_classes = [
        IsUserAdminPermission,
    ]

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        data: BULK_RESPONSE = delete_users_service(
            ids_to_delete=serializer.validated_data["ids"],
            request_user=request.user,
        )
        return Response(data, status=HTTP_200_OK)
