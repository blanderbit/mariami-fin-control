"""
Views for documents API endpoints.
"""

import logging

from rest_framework import status
from authentication.permissions import (
    AllowAnyPermission,
)
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.serializers.documents_serializers import DocumentsListSerializer
from users.services.documents_service import DocumentsService

logger = logging.getLogger(__name__)


class DocumentsView(APIView):
    """
    API view for retrieving document files and public URLs.
    Returns all available document URLs similar to templates API.
    """

    permission_classes = [AllowAnyPermission]

    @swagger_auto_schema(
        operation_description="""
        Get public URLs for all document files.
        Returns cached URLs for optimal performance.
        """,
        responses={
            200: openapi.Response(
                "Documents retrieved successfully", DocumentsListSerializer
            ),
            500: "Internal server error",
        },
        tags=["Documents"],
    )
    def get(self, request: Request) -> Response:
        """
        Get all document URLs.

        Returns:
            Response with document URLs for all available documents
        """
        try:
            service = DocumentsService()
            urls = service.get_document_urls()

            return Response(urls, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Error in documents view: {str(e)}")
            return Response(
                {"error": "Failed to retrieve documents"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )