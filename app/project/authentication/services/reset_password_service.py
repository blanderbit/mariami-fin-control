from users.models import UserModel
from authentication.models import VerifyCodeModel
from authentication.services.send_email_service import send_email_template_service
from authentication.constants.success import (
    TEMPLATE_SUCCESS_BODY_TITLE,
    TEMPLATE_SUCCESS_TEXT,
    TEMPLATE_SUCCESS_TITLE,
)
from config.exceptions import ObjectNotFoundException


def reset_password_service(*, verify_code: str, new_password: str) -> None:
    try:
        verify_code: str = verify_code
        code: VerifyCodeModel = VerifyCodeModel.objects.get(verify_code=verify_code)
        user: UserModel = UserModel.objects.get(email__iexact=code.user_email)
        user.set_password(new_password)
        user.save()
        code.delete()
        send_email_template_service(
            user=user,
            body_title=TEMPLATE_SUCCESS_BODY_TITLE.format(key="password"),
            title=TEMPLATE_SUCCESS_TITLE.format(key="password"),
            text=TEMPLATE_SUCCESS_TEXT.format(key="password"),
        )
    except UserModel.DoesNotExist:
        raise ObjectNotFoundException(object=UserModel)
