from users.models import UserModel
from config.exceptions import ObjectNotFoundException
from authentication.constants.code_types import (
    PASSWORD_RESET_CODE_TYPE,
)
from authentication.services.create_verify_code_service import (
    create_verify_code_service,
)

def request_reset_password_service(user_email: str) -> None:
    try:
        UserModel.objects.get(email__iexact=user_email)
        create_verify_code_service(
            email=user_email, type=PASSWORD_RESET_CODE_TYPE, dop_info=None
        )
    except UserModel.DoesNotExist:
        raise ObjectNotFoundException(object=UserModel)
