from rest_framework.permissions import (
    BasePermission,
)
from rest_framework.request import Request


class IsNotAuthenticatedPermission(BasePermission):
    """allows access only to not authenticated users"""

    def has_permission(self, request: Request, view) -> bool:
        return request.user.id is None
