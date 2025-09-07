from django.contrib.auth import backends
from django.contrib.auth import get_user_model


class CaseInsensitiveEmailBackend(backends.ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()
        if email is None:
            email = kwargs.get(UserModel.EMAIL_FIELD)
        try:
            user = UserModel._default_manager.get(email__iexact=email)
        except UserModel.DoesNotExist:
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
