import logging
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.serializers.revenue_analysis_serializer import (
    RevenueAnalysisQuerySerializer,
    RevenueAnalysisResponseSerializer
)
from users.services.revenue_analysis_service import UserDataAnalysisService

logger = logging.getLogger(__name__)


class RevenueAnalysisAPIView(APIView):
    """API View for revenue analysis"""
    
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'period',
                openapi.IN_QUERY,
                description=(
                    "Analysis period: 'month' for month-to-month comparison, "
                    "'year' for year-to-year comparison"
                ),
                type=openapi.TYPE_STRING,
                enum=['month', 'year'],
                required=True
            ),
        ],
        responses={
            200: RevenueAnalysisResponseSerializer,
            400: 'Bad Request - Invalid period parameter',
            401: 'Unauthorized',
            404: 'No data found for analysis',
            500: 'Internal Server Error'
        },
        operation_description=(
            "Analyze user's revenue comparing current period with previous. "
            "Supports month-to-month and year-to-year comparisons. "
            "Data is calculated exclusively from user's uploaded P&L files "
            "using the Revenue column."
        ),
        operation_summary="Get revenue analysis",
        tags=['Analytics']
    )
    def get(self, request):
        """Get revenue analysis for authenticated user"""
        
        # Validate query parameters
        query_serializer = RevenueAnalysisQuerySerializer(
            data=request.query_params
        )
        
        if not query_serializer.is_valid():
            return Response(
                {
                    'error': 'Invalid query parameters',
                    'details': query_serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        period_type = query_serializer.validated_data['period']
        
        try:
            # Initialize analysis service
            analysis_service = UserDataAnalysisService(request.user)
            
            # Get revenue analysis
            analysis_result = analysis_service.get_revenue_analysis(
                period_type
            )
            
            # Serialize and return response
            response_serializer = RevenueAnalysisResponseSerializer(
                analysis_result
            )
            
            logger.info(
                f"Revenue analysis completed for user {request.user.id}, "
                f"period: {period_type}"
            )
            
            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK
            )
            
        except FileNotFoundError:
            logger.warning(
                f"No data files found for user {request.user.id}"
            )
            return Response(
                {
                    'error': 'No data available for analysis',
                    'message': (
                        'Please upload your P&L (Profit & Loss) file '
                        'before requesting revenue analysis.'
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )
            
        except ValueError as e:
            logger.error(
                f"Data validation error for user {request.user.id}: {str(e)}"
            )
            return Response(
                {
                    'error': 'Invalid data format',
                    'message': (
                        'Your uploaded data files contain invalid formats. '
                        'Please check the data and re-upload.'
                    ),
                    'details': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(
                f"Unexpected error during revenue analysis "
                f"for user {request.user.id}: {str(e)}",
                exc_info=True
            )
            return Response(
                {
                    'error': 'Analysis failed',
                    'message': (
                        'An unexpected error occurred during analysis. '
                        'Please try again later.'
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )