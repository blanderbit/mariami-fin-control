from config.openapi import (
    CustomOpenAPISchemaGenerator,
)
from authentication.permissions import (
    AllowAnyPermission
)
from django.urls import path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view


schema_view = get_schema_view(
    openapi.Info(
        title="MariaMi",
        default_version="0.0.1",
    ),
    public=True,
    permission_classes=(AllowAnyPermission,),
    generator_class=CustomOpenAPISchemaGenerator,
)

urlpatterns = [
    re_path(
        r"^api/v1/swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
]
