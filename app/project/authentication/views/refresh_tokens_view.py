from authentication.permissions import (
    AllowAnyPermission,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


class RefreshTokensView(TokenRefreshView):
    """
    Refresh jwt tokens

    """
    permission_classes = [
        AllowAnyPermission,
    ]
    pass
