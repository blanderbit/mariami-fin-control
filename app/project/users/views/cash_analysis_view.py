from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.services.cash_analysis_service import UserCashAnalysisService
from users.serializers.cash_analysis_serializers import (
    CashAnalysisResponseSerializer,
)
from config.utils.error_handlers import (
    create_not_found_error_response,
    create_server_error_response,
)


class CashAnalysisView(APIView):
    """
    API endpoint for analyzing user cash flow from transactions

    Provides analysis of transaction data including:
    - Total income from all income transactions
    - Total expense from all expense transactions
    """

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Get cash analysis",
        operation_description=(
            "Analyze user's transaction data to calculate total income "
            "and total expense. Requires transactions_template file to "
            "be uploaded."
        ),
        responses={
            200: CashAnalysisResponseSerializer,
            400: openapi.Response(
                description="Bad Request - No transaction data found",
                examples={
                    "application/json": {
                        "error": "No transaction data found for user"
                    }
                },
            ),
            404: openapi.Response(
                description="Not Found - User data file not found",
                examples={
                    "application/json": {
                        "error": "Transaction data file not found"
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
        tags=["Cash Analysis"],
    )
    def get(self, request):
        """
        Get cash analysis from transaction data

        Returns total income and expense calculated from the user's
        most recent transactions template file.
        """
        try:
            service = UserCashAnalysisService(request.user)
            analysis_result = service.get_cash_analysis()

            serializer = CashAnalysisResponseSerializer(data=analysis_result)
            serializer.is_valid(raise_exception=True)

            return Response(
                serializer.validated_data,
                status=status.HTTP_200_OK
            )

        except ValueError as e:
            if "No transaction data found" in str(e):
                return create_not_found_error_response(str(e))
            return create_server_error_response(
                "Error processing transaction data"
            )

        except Exception as e:
            return create_server_error_response(
                f"An error occurred: {str(e)}"
            )