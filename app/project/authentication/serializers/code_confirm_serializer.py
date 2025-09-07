from authentication.constants.code_types import (
    ACCOUNT_DELETE_CODE_TYPE,
    EMAIL_CHANGE_CODE_TYPE,
    EMAIL_VERIFY_CODE_TYPE,
    PASSWORD_CHANGE_CODE_TYPE,
)
from authentication.validators import (
    VerifyCodeValidator,
)
from rest_framework.serializers import (
    CharField,
    Serializer,
)

class CodeConfirmSerializer(Serializer):
    verify_code: str = CharField(min_length=5, max_length=5, write_only=True)

    class Meta:
        validators = [
            VerifyCodeValidator(
                token_type=[
                    PASSWORD_CHANGE_CODE_TYPE,
                    EMAIL_CHANGE_CODE_TYPE,
                    EMAIL_VERIFY_CODE_TYPE,
                    ACCOUNT_DELETE_CODE_TYPE,
                ]
            )
        ]
        fields = [
            "verify_code",
        ]
