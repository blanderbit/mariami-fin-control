from django.urls import path
from profile.views import GetMyProfileView, RequestToDeleteMyProfileView
from profile.views.onboarding_view import OnboardingView, OnboardingStatusView
from profile.views.currencies_view import CurrenciesListView

urlpatterns = [
    path("profile", GetMyProfileView.as_view(), name="get-my-profile"),
    path(
        "profile",
        RequestToDeleteMyProfileView.as_view(),
        name="request-to-delete-my-profile",
    ),
    path("onboarding", OnboardingView.as_view(), name="onboarding"),
    path("onboarding/status", OnboardingStatusView.as_view(), name="onboarding-status"),
    path("currencies", CurrenciesListView.as_view(), name="currencies-list"),
]
