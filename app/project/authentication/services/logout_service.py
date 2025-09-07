from authentication.constants.errors import INVALID_REFRESH_TOKEN
from rest_framework.serializers import (
    ValidationError,
)
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
)
from rest_framework_simplejwt.tokens import (
    RefreshToken,
    TokenError,
)


def logout_service(refresh_token: str) -> None:
    try:
        RefreshToken(refresh_token).blacklist()
    except TokenError:
        raise ValidationError(INVALID_REFRESH_TOKEN, HTTP_400_BAD_REQUEST)
