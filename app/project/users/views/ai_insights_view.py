from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.services.ai_insights_service import UserAIInsightsService
from users.serializers.ai_insights_serializers import (
    AIInsightsResponseSerializer,
)
from users.serializers.analysis_start_end_date_params_serialier import (
    StartAndEndDateParamsSerializer,
)
from config.utils.error_handlers import (
    create_not_found_error_response,
    create_server_error_response,
)


class AIInsightsView(APIView):
    """
    API endpoint for generating AI-powered business insights

    Combines data from P&L analysis, invoices analysis, and cash analysis
    to generate comprehensive business insights using AI/LLM technology.
    Provides exactly 4 concise, actionable insights based on company data.
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get AI-powered business insights",
        operation_description=(
            "Generate AI insights by analyzing combined financial data "
            "from P&L, invoices, and cash analysis. Returns exactly 4 "
            "concise business insights with actionable recommendations. "
            "Requires uploaded data files (pnl_template, invoices_template, "
            "transactions_template) for comprehensive analysis."
        ),
        query_serializer=StartAndEndDateParamsSerializer,
        responses={
            200: AIInsightsResponseSerializer,
            400: openapi.Response(
                description="Bad Request - Invalid parameters",
                examples={
                    "application/json": {
                        "error": "Invalid date format or missing parameters"
                    }
                },
            ),
            404: openapi.Response(
                description="Not Found - Insufficient data for analysis",
                examples={
                    "application/json": {
                        "error": "No sufficient data found for AI analysis"
                    }
                },
            ),
            500: openapi.Response(
                description="Internal Server Error",
                examples={
                    "application/json": {
                        "error": "Error generating AI insights"
                    }
                },
            ),
        },
        tags=["AI Analysis"],
    )
    def get(self, request):
        """
        Generate AI-powered business insights for specified date range

        Query Parameters:
        - start_date (YYYY-MM-DD): Start date for analysis period
        - end_date (YYYY-MM-DD): End date for analysis period

        Returns exactly 4 business insights combining:
        - Revenue, expense, and profit trends
        - Cash flow and collection metrics  
        - Month-over-month and year-over-year changes
        - Industry benchmarks and actionable recommendations
        """
        try:
            # Validate query parameters
            query_serializer = StartAndEndDateParamsSerializer(
                data=request.query_params
            )
            query_serializer.is_valid(raise_exception=True)
            
            start_date = query_serializer.validated_data['start_date']
            end_date = query_serializer.validated_data['end_date']

            service = UserAIInsightsService(request.user)
            insights_result = service.get_ai_insights(start_date, end_date)

            # Validate response structure
            serializer = AIInsightsResponseSerializer(data=insights_result)
            serializer.is_valid(raise_exception=True)

            return Response(
                serializer.validated_data,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            error_message = str(e)
            if "No" in error_message and "data found" in error_message:
                return create_not_found_error_response(
                    "Insufficient data available for AI analysis"
                )
            return create_server_error_response(
                "Error processing data for AI analysis"
            )

        except Exception as e:
            return create_server_error_response(
                f"Error generating AI insights: {str(e)}"
            )