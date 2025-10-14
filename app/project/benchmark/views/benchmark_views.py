"""
API Views for benchmark data
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from ..services.oecd_service_v2 import OECDDataService

logger = logging.getLogger(__name__)


class BenchmarkMarketOverviewView(APIView):
    """
    API endpoint for market overview benchmark data
    
    Returns all cached benchmark data organized by categories:
    - macro_pulse: Core economic indicators
    - operating_pressure: Business operation cost indicators
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get complete market overview data from cache
        
        Returns:
            JSON response with categorized benchmark data
        """
        try:
            # Get data from cache
            oecd_service = OECDDataService()
            cached_data = oecd_service.fetch_oecd_long_term_rate()
            
            # # Add supported countries info
            # cached_data['supported_countries'] = [
            #     {
            #         'code': country['frontend_code'],
            #         'name': country['name'],
            #         'oecd_code': country['code']
            #     }
            #     for country in settings.BENCHMARK_SUPPORTED_COUNTRIES
            # ]
            
            # # Serialize response
            # serializer = BenchmarkMarketOverviewSerializer(cached_data)
            
            return Response(
                {
                    'success': True,
                    'data': cached_data,
                    'message': 'Market overview data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving market overview: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve market overview data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )