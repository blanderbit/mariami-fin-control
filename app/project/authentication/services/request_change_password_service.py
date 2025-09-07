from authentication.services.create_verify_code_service import (
    create_verify_code_service,
)
from authentication.constants.code_types import (
    PASSWORD_CHANGE_CODE_TYPE,
)


def request_change_password_service(*, email: str, new_password: str) -> None:
    create_verify_code_service(
        email=email,
        type=PASSWORD_CHANGE_CODE_TYPE,
        dop_info={"password": new_password},
    )
