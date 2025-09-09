from authentication.views import (
    LoginView,
    LogoutView,
    RefreshTokensView,
    RegistrationView,
    RequestPasswordResetView,
    RequestChangePasswordView,
    ConfirmResetPassword,
    CodeConfirmView,
    ValidateResetPasswordCodeView,
)
from django.urls import path

urlpatterns = [
    path("login", LoginView.as_view(), name="login"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("refresh", RefreshTokensView.as_view(), name="refresh-tokens"),
    path("registration", RegistrationView.as_view(), name="registration"),
    path(
        "password/reset",
        RequestPasswordResetView.as_view(),
        name="request-password-reset",
    ),
    path(
        "password/reset/confirm",
        ConfirmResetPassword.as_view(),
        name="confirm-password-reset",
    ),
    path(
        "password/change",
        RequestChangePasswordView.as_view(),
        name="request-password-change",
    ),
    path("code/confirm", CodeConfirmView.as_view(), name="rcode-confirm"),
    path(
        "confirmation/code/validate",
        ValidateResetPasswordCodeView.as_view(),
        name="validate-reset-password-confirmation-code",
    ),
]
