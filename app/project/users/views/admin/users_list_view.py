from typing import Type

from users.filters import (
    USERS_LIST_ORDERING_FIELDS,
    USERS_LIST_SEARCH_FIELDS,
)
from users.models import UserModel
from users.serializers import UsersListSerializer
from users.openapi import (
    users_list_query_params,
)
from authentication.permissions import (
    IsUserAdminPermission
)
from django.db.models.query import QuerySet
from django.utils.decorators import (
    method_decorator,
)
from django_filters.rest_framework import (
    DjangoFilterBackend,
)
from drf_yasg.utils import swagger_auto_schema
from rest_framework.filters import (
    OrderingFilter,
    SearchFilter,
)
from rest_framework.generics import ListAPIView
from rest_framework.serializers import Serializer
from config.decorators import paginate_by_offset


@method_decorator(
    swagger_auto_schema(manual_parameters=users_list_query_params, tags=["users"]),
    name="get",
)
class UsersListView(ListAPIView):
    """
    List of users

    This class makes it possible to
    get a list of all users of the application.
    """

    serializer_class: Type[Serializer] = UsersListSerializer
    queryset: QuerySet[UserModel] = UserModel.get_all()
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    ordering_fields = USERS_LIST_ORDERING_FIELDS
    search_fields = USERS_LIST_SEARCH_FIELDS
    permission_classes = [IsUserAdminPermission]

    def get_queryset(self) -> QuerySet[UserModel]:
        return self.queryset
    
