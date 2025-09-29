from datetime import datetime
import logging
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from users.serializers.analysis_start_end_date_params_serialier import (
    StartAndEndDateParamsSerializer,
)
from users.services.financial_analysis_service import UserPNLAnalysisService
from config.utils.error_handlers import (
    create_not_found_error_response,
    create_server_error_response,
)

logger = logging.getLogger(__name__)


@permission_classes([IsAuthenticated])
class PNLAnalysisAPIView(APIView):
    """
    API view for P&L analysis with custom date range

    This endpoint allows users to analyze their P&L data for a specific
    date range and get detailed data along with aggregated metrics.
    """

    @swagger_auto_schema(
        operation_id="get_pnl_analysis",
        operation_description="""
        Get P&L analysis for a specific date range.
        
        This endpoint:
        1. Fetches user's P&L data for the specified period
        2. Returns the filtered P&L data as a list
        3. Calculates total revenue (sum of Revenue column)
        4. Calculates total expenses (sum of all expenses fields)
        5. Calculates net profit (revenue - expenses)
        6. Provides 1-month and 1-year comparison with percentage changes
        
        The response includes:
        - pnl_data: Array of P&L records for the requested period
        - total_revenue: Sum of all revenue for the period
        - total_expenses: Sum of all expense categories for the period  
        - net_profit: Total revenue minus total expenses
        - month_change: Comparison with same period 1 month ago
        - year_change: Comparison with same period 1 year ago
        """,
        manual_parameters=[
            openapi.Parameter(
                "start_date",
                openapi.IN_QUERY,
                description="Start date for analysis period (YYYY-MM-DD format)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                required=True,
                example="2024-01-01",
            ),
            openapi.Parameter(
                "end_date",
                openapi.IN_QUERY,
                description="End date for analysis period (YYYY-MM-DD format)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
                required=True,
                example="2024-12-31",
            ),
        ],
        tags=["P&L Analysis"],
        responses={
            200: openapi.Response(
                description="P&L analysis data",
                examples={
                    "application/json": {
                        "pnl_data": [
                            {
                                "Month": "2024-01-01",
                                "Revenue": 15000.0,
                                "COGS": 5000.0,
                                "Payroll": 3000.0,
                                "Rent": 1000.0,
                                "Marketing": 500.0,
                                "Other_Expenses": 200.0,
                            },
                            {
                                "Month": "2024-02-01",
                                "Revenue": 18000.0,
                                "COGS": 6000.0,
                                "Payroll": 3000.0,
                                "Rent": 1000.0,
                                "Marketing": 800.0,
                                "Other_Expenses": 300.0,
                            },
                        ],
                        "total_revenue": 33000.0,
                        "total_expenses": 19800.0,
                        "net_profit": 13200.0,
                        "month_change": {
                            "revenue": {"change": 2000.0, "percentage_change": 6.45},
                            "expenses": {"change": -500.0, "percentage_change": -2.46},
                            "net_profit": {
                                "change": 2500.0,
                                "percentage_change": 23.36,
                            },
                        },
                        "year_change": {
                            "revenue": {"change": 5000.0, "percentage_change": 17.86},
                            "expenses": {"change": 1000.0, "percentage_change": 5.32},
                            "net_profit": {
                                "change": 4000.0,
                                "percentage_change": 43.48,
                            },
                        },
                        "period": {
                            "start_date": "2024-01-01",
                            "end_date": "2024-02-29",
                        },
                        "ai_insights": "Strong revenue growth YoY, monitor expense efficiency for margins.",
                    }
                },
            ),
            400: "Invalid parameters",
            401: "Authentication required",
            404: "No P&L data found for user",
        },
    )
    def get(self, request):
        """Get P&L analysis for date range"""
        serializer = StartAndEndDateParamsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data["end_date"]
        try:
            # Get analysis from service
            analysis_service = UserPNLAnalysisService(request.user)
            analysis_result = analysis_service.get_pnl_analysis(start_date, end_date)

            return Response(analysis_result, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.error(f"No P&L data for user {request.user.id}: {str(e)}")
            return create_not_found_error_response(
                "pnl_data", message="Please upload P&L data before requesting analysis"
            )
        except Exception as e:
            logger.error(
                f"Unexpected error during P&L analysis "
                f"for user {request.user.id}: {str(e)}"
            )
            return create_server_error_response("Internal server error")
