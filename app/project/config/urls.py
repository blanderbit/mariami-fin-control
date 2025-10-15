from config.yasg import urlpatterns as doc_urls
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path("api/v1/users/", include("users.urls"), name="users"),
    path("api/v1/auth/", include("authentication.urls"), name="auth"),
    path("api/v1/profile/", include("profile.urls"), name="profile"),
    path("api/v1/benchmark/", include("benchmark.urls"), name="benchmark"),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += doc_urls
