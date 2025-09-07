from django.urls import path
from profile.views import GetMyProfileView, RequestToDeleteMyProfileView

urlpatterns = [
    path("client/my/profile", GetMyProfileView.as_view(), name="get-my-profile"),
    path(
        "client/request/delete/my/profile",
        RequestToDeleteMyProfileView.as_view(),
        name="request-to-delete-my-profile",
    ),
]
