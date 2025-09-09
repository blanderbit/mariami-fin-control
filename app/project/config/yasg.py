from config.openapi import (
    CustomOpenAPISchemaGenerator,
)
from authentication.permissions import (
    AllowAnyPermission
)
from django.urls import path
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
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
]
