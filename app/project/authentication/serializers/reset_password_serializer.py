from authentication.constants.code_types import (
    PASSWORD_RESET_CODE_TYPE
)
from authentication.validators import (
    VerifyCodeValidator,
)
from rest_framework.serializers import (
    CharField,
    Serializer,
)

class ResetPasswordSerializer(Serializer):
    new_password: str = CharField(min_length=8, max_length=68, write_only=True)
    verify_code: str = CharField(min_length=5, max_length=5, write_only=True)

    class Meta:
        validators = [VerifyCodeValidator(token_type=PASSWORD_RESET_CODE_TYPE)]
        fields = [
            "verify_code",
            "new_password",
        ]
