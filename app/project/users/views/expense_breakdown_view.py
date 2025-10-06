from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.services.financial_analysis_service import UserPNLAnalysisService
from users.serializers.analysis_start_end_date_params_serialier import (
    StartAndEndDateParamsSerializer,
)
from config.utils.error_handlers import (
    create_server_error_response,
)


class ExpenseBreakdownView(APIView):
    """
    API endpoint for analyzing expense breakdown by category

    Provides analysis of expense data including:
    - Total amount per expense category for specified period
    - Spike detection (MoM > +20% or category ≥3% of total expenses)
    - New category detection (for future enhancement)
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get expense breakdown analysis",
        operation_description=(
            "Analyze user's expense data by category for a specific date range. "
            "Returns breakdown with total amounts, spike detection, and new "
            "category flags. Requires pnl_template file to be uploaded."
        ),
        query_serializer=StartAndEndDateParamsSerializer,
        responses={
            400: openapi.Response(
                description="Bad Request - Invalid parameters or no data",
                examples={
                    "application/json": {
                        "error": "Invalid date format or missing parameters"
                    }
                },
            ),

            500: openapi.Response(
                description="Internal Server Error",
                examples={
                    "application/json": {
                        "error": "An error occurred while processing"
                    }
                },
            ),
        },
        tags=["Expense Analysis"],
    )
    def get(self, request):
        """
        Get expense breakdown analysis for specified date range

        Query Parameters:
        - start_date (YYYY-MM-DD): Start date for analysis period
        - end_date (YYYY-MM-DD): End date for analysis period
        """
        try:
            # Validate query parameters
            query_serializer = StartAndEndDateParamsSerializer(
                data=request.query_params
            )
            query_serializer.is_valid(raise_exception=True)
            
            start_date = query_serializer.validated_data['start_date']
            end_date = query_serializer.validated_data['end_date']

            service = UserPNLAnalysisService(request.user)
            breakdown_result = service.get_expense_breakdown(start_date, end_date)

            return Response(
                breakdown_result,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            error_message = str(e)
            if ("No P&L data found" in error_message or
                    "No data found for the specified period" in error_message):
                # Return empty breakdown data instead of 404
                empty_breakdown = {}
                return Response(
                    empty_breakdown,
                    status=status.HTTP_200_OK
                )
            return create_server_error_response(
                "Error processing expense data"
            )

        except Exception as e:
            return create_server_error_response(
                f"An error occurred: {str(e)}"
            )