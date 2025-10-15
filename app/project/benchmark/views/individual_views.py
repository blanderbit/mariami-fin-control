"""
Individual API Views for each benchmark indicator
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from authentication.permissions import AllowAnyPermission

from ..tasks.individual_tasks import (
    fetch_inflation_task,
    fetch_short_term_rate_task,
    fetch_long_term_rate_task,
    fetch_consumer_confidence_task,
    fetch_wage_growth_task,
    fetch_rent_index_task,
    fetch_energy_utilities_task,
    fetch_tax_burden_task
)
from ..services.oecd_functions import get_indicator_last_update

logger = logging.getLogger(__name__)


class InflationBenchmarkView(APIView):
    """API endpoint for inflation benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get inflation data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_inflation_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('inflation')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'inflation',
                    'message': 'Inflation data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving inflation data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve inflation data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ShortTermRateBenchmarkView(APIView):
    """API endpoint for short-term interest rate benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get short-term rate data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_short_term_rate_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('short_term_rate')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'short_term_rate',
                    'message': 'Short-term rate data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving short-term rate data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve short-term rate data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LongTermRateBenchmarkView(APIView):
    """API endpoint for long-term interest rate benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get long-term rate data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_long_term_rate_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('long_term_rate')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'long_term_rate',
                    'message': 'Long-term rate data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving long-term rate data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve long-term rate data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConsumerConfidenceBenchmarkView(APIView):
    """API endpoint for consumer confidence benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get consumer confidence data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_consumer_confidence_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('consumer_confidence')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'consumer_confidence',
                    'message': 'Consumer confidence data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving consumer confidence data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve consumer confidence data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WageGrowthBenchmarkView(APIView):
    """API endpoint for wage growth benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get wage growth data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_wage_growth_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('wage_growth')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'wage_growth',
                    'message': 'Wage growth data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving wage growth data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve wage growth data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RentIndexBenchmarkView(APIView):
    """API endpoint for rent index benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get rent index data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_rent_index_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('rent_index')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'rent_index',
                    'message': 'Rent index data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving rent index data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve rent index data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EnergyUtilitiesBenchmarkView(APIView):
    """API endpoint for energy & utilities benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get energy utilities data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_energy_utilities_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('energy_utilities')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'energy_utilities',
                    'message': 'Energy utilities data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving energy utilities data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve energy utilities data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TaxBurdenBenchmarkView(APIView):
    """API endpoint for tax burden benchmark data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get tax burden data from cache or fetch from OECD"""
        try:
            # Call Celery task (will return cached data or fetch fresh)
            result = fetch_tax_burden_task.delay()
            data = result.get(timeout=60)
            
            # Get last update timestamp
            last_update = get_indicator_last_update('tax_burden')
            
            return Response(
                {
                    'success': True,
                    'data': data,
                    'last_update': last_update,
                    'indicator': 'tax_burden',
                    'message': 'Tax burden data retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving tax burden data: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve tax burden data',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SupportedCountriesView(APIView):
    """API endpoint for supported countries list"""
    permission_classes = [AllowAnyPermission]
    
    def get(self, request):
        """Get list of supported countries"""
        try:
            from django.conf import settings
            
            # Get supported countries from settings
            supported_countries = getattr(settings, 'SUPPORTED_COUNTRIES', [])
            
            return Response(
                {
                    'success': True,
                    'data': supported_countries,
                    'message': 'Supported countries retrieved successfully'
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error retrieving supported countries: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Failed to retrieve supported countries',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )