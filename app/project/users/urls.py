from django.urls import path
from users.views.admin import (
    UsersListView,
    DeleteUsersView,
    UpdateUserView,
)
from users.views import CheckIsUserAdminView

urlpatterns = [
    path("admin/users", UsersListView.as_view(), name="users-list"),
    path("admin/users", DeleteUsersView.as_view(), name="delete-users"),
    path("admin/users", UpdateUserView.as_view(), name="update-user"),
    path(
        "client/users/is-admin",
        CheckIsUserAdminView.as_view(),
        name="is-user-admin",
    ),
]
