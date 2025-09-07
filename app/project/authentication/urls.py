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
    AuthAnalyticsView,
)
from django.urls import path

urlpatterns = [
    path("client/login", LoginView.as_view(), name="login"),
    path("client/logout", LogoutView.as_view(), name="logout"),
    path("client/refresh/tokens", RefreshTokensView.as_view(), name="refresh-tokens"),
    path("client/registration", RegistrationView.as_view(), name="registration"),
    path(
        "client/request/password/reset",
        RequestPasswordResetView.as_view(),
        name="request-password-reset",
    ),
    path(
        "client/confirm/password/reset",
        ConfirmResetPassword.as_view(),
        name="confirm-password-reset",
    ),
    path(
        "client/request/password/change",
        RequestChangePasswordView.as_view(),
        name="request-password-change",
    ),
    path("client/code/confirm", CodeConfirmView.as_view(), name="rcode-confirm"),
    path(
        "client/validate/reset/password/confirmation/code",
        ValidateResetPasswordCodeView.as_view(),
        name="validate-reset-password-confirmation-code",
    ),
    path(
        "admin/auth/analytics",
        AuthAnalyticsView.as_view(),
        name="validate-reset-password-confirmation-code",
    ),
]
