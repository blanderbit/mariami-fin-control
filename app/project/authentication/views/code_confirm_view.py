from authentication.constants.code_types import (
    ACCOUNT_DELETE_CODE_TYPE,
    EMAIL_CHANGE_CODE_TYPE,
    EMAIL_VERIFY_CODE_TYPE,
    PASSWORD_CHANGE_CODE_TYPE,
)
from authentication.models import VerifyCodeModel
from authentication.serializers import (
    CodeConfirmSerializer,
)
from authentication.services import (
    change_password_serivce,
    change_email_service,
    account_delete_service,
    verify_email_service,
)
from users.models import UserModel
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response


class CodeConfirmView(GenericAPIView):
    """
    Сode confirmations

    This endpoint allows the user to:
    confirm changing the password,,
    email, account verification, as well as deleting
    the account using the previously received code
    that comes to the mail
    """

    serializer_class = CodeConfirmSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        verify_code: str = serializer.validated_data["verify_code"]
        self.code: VerifyCodeModel = VerifyCodeModel.objects.get(
            verify_code=verify_code
        )
        self.user: UserModel = UserModel.objects.get(id=request.user.id)

        if self.code.type == PASSWORD_CHANGE_CODE_TYPE:
            return change_password_serivce(user=self.user, confirm_code=self.code)

        elif self.code.type == EMAIL_CHANGE_CODE_TYPE:
            return change_email_service(user=self.user, confirm_code=self.code)

        elif self.code.type == ACCOUNT_DELETE_CODE_TYPE:
            return account_delete_service(user=self.user, confirm_code=self.code)

        elif self.code.type == EMAIL_VERIFY_CODE_TYPE:
            return verify_email_service(user=self.user, confirm_code=self.code)