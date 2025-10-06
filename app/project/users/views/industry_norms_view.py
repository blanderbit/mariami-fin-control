"""
Views for industry norms API endpoints.
"""

import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.serializers.industry_norms_serializers import (
    IndustriesListSerializer,
    IndustryDetailsSerializer,
)
from users.services.industry_norms_service import IndustryNormsService

logger = logging.getLogger(__name__)


class IndustriesListView(APIView):
    """
    API view for retrieving list of available industries.
    Results are cached for 24 hours for optimal performance.
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="""
        Get list of all available industries from Industry_norms.csv file.
        Returns cached results for optimal performance (24 hours cache).
        """,
        responses={
            200: openapi.Response(
                "Industries list retrieved successfully",
                IndustriesListSerializer
            ),
            500: "Internal server error",
        },
        tags=["Industries"],
    )
    def get(self, request: Request) -> Response:
        """
        Get list of all available industries.

        Returns:
            Response with list of industry names
        """
        try:
            service = IndustryNormsService()
            industries = service.get_industries_list()

            return Response(
                {"industries": industries},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error in industries list view: {str(e)}")
            return Response(
                {"error": "Failed to retrieve industries list"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class IndustryDetailsView(APIView):
    """
    API view for retrieving detailed information about a specific industry.
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="""
        Get detailed information for a specific industry including
        margins, cash buffer recommendations, and other financial metrics.
        """,
        manual_parameters=[
            openapi.Parameter(
                'industry_name',
                openapi.IN_PATH,
                description="Name of the industry to get details for",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                "Industry details retrieved successfully",
                IndustryDetailsSerializer
            ),
            404: "Industry not found",
            500: "Internal server error",
        },
        tags=["Industries"],
    )
    def get(self, request: Request, industry_name: str) -> Response:
        """
        Get detailed information for a specific industry.

        Args:
            industry_name: Name of the industry to get details for

        Returns:
            Response with industry details or error
        """
        try:
            service = IndustryNormsService()
            industry_details = service.get_industry_details(industry_name)

            if industry_details is None:
                return Response(
                    {"error": f"Industry '{industry_name}' not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                industry_details,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(
                f"Error in industry details view for {industry_name}: {str(e)}"
            )
            return Response(
                {"error": "Failed to retrieve industry details"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )