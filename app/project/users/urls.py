from django.urls import path
from users.views.admin import (
    UsersListView,
    DeleteUsersView,
    UpdateUserView,
)
from users.views import CheckIsUserAdminView
from users.views.file_upload_views import UploadUserDataAPIView
from users.views.financial_analysis_view import (
    FinancialAnalysisAPIView
)

urlpatterns = [
    path("admin/users", UsersListView.as_view(), name="users-list"),
    path("admin/users", DeleteUsersView.as_view(), name="delete-users"),
    path("admin/users", UpdateUserView.as_view(), name="update-user"),
    path(
        "client/users/is-admin",
        CheckIsUserAdminView.as_view(),
        name="is-user-admin",
    ),
    path(
        "upload/data-files",
        UploadUserDataAPIView.as_view(),
        name="upload-data-files"
    ),
    path(
        "financial-analysis",
        FinancialAnalysisAPIView.as_view(),
        name="financial-analysis"
    ),
]
    