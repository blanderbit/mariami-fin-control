from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.services.invoices_analysis_service import UserInvoicesAnalysisService
from users.serializers.invoices_analysis_serializers import (
    InvoicesAnalysisResponseSerializer,
)
from users.serializers.analysis_start_end_date_params_serialier import (
    StartAndEndDateParamsSerializer,
)
from config.utils.error_handlers import (
    create_not_found_error_response,
    create_server_error_response,
)


class InvoicesAnalysisView(APIView):
    """
    API endpoint for analyzing user invoices data

    Provides comprehensive analysis of invoices including:
    - Total invoice count
    - Paid invoices metrics (count and amount)
    - Overdue invoices metrics (count and amount)
    - Month-over-month and year-over-year changes
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get invoices analysis",
        operation_description=(
            "Analyze user's invoices data for a specific date range. "
            "Returns metrics for paid and overdue invoices with change "
            "calculations."
        ),
        query_serializer=StartAndEndDateParamsSerializer,
        responses={
            200: InvoicesAnalysisResponseSerializer,
            400: openapi.Response(
                description="Bad Request - Invalid parameters",
                examples={
                    "application/json": {
                        "error": (
                            "Invalid date format or missing required "
                            "parameters"
                        )
                    }
                },
            ),
            404: openapi.Response(
                description="Not Found - No invoices data found",
                examples={
                    "application/json": {
                        "error": "No invoices data found for user"
                    }
                },
            ),
        },
        tags=["Invoices Analysis"],
    )
    def get(self, request):
        """
        Get invoices analysis for specified date range

        Query Parameters:
        - start_date (required): Start date for analysis period (YYYY-MM-DD)
        - end_date (required): End date for analysis period (YYYY-MM-DD)

        Returns:
        - total_count: Total number of invoices in the period
        - paid_invoices: Count and amount of paid invoices
        - overdue_invoices: Count and amount of overdue invoices
        - month_change: Month-over-month changes
        - year_change: Year-over-year changes
        - period: Analysis period information
        """
        # Validate request parameters
        serializer = StartAndEndDateParamsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data["end_date"]

        try:
            # Initialize service and get analysis
            service = UserInvoicesAnalysisService(request.user)
            analysis_data = service.get_invoices_analysis(start_date, end_date)

            # Serialize response
            response_serializer = InvoicesAnalysisResponseSerializer(
                data=analysis_data
            )
            response_serializer.is_valid(raise_exception=True)

            return Response(
                response_serializer.validated_data, status=status.HTTP_200_OK
            )

        except ValueError as e:
            return create_not_found_error_response(
                "invoices_data",
                message=str(e)
            )
        except Exception:
            return create_server_error_response(
                "An error occurred while analyzing invoices data"
            )
