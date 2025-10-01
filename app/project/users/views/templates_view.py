"""
Views for user templates API endpoints.
"""

import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.serializers.templates_serializers import TemplateListSerializer
from users.services.templates_service import UserTemplatesService

logger = logging.getLogger(__name__)


class UserTemplatesView(APIView):
    """
    API view for retrieving user template files and public URLs.
    Returns all available template URLs in a simple format.
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="""
        Get public URLs for all template files (P&L, transactions, invoices).
        Returns cached URLs for optimal performance.
        """,
        responses={
            200: openapi.Response(
                "Templates retrieved successfully", TemplateListSerializer
            ),
            500: "Internal server error",
        },
        tags=["Templates"],
    )
    def get(self, request: Request) -> Response:
        """
        Get all template URLs.

        Returns:
            Response with template URLs for all available templates
        """
        try:
            service = UserTemplatesService()
            urls = service.get_template_urls()

            return Response(urls, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error in templates view: {str(e)}")
            return Response(
                {"error": "Failed to retrieve templates"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
