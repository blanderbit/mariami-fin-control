from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from authentication.permissions import AllowAnyPermission
from config.settings.components.currencies import get_currencies_list


class CurrenciesListView(APIView):
    """
    API endpoint to provide list of supported currencies
    """
    
    permission_classes = [AllowAnyPermission]
    
    def get(self, request):
        """
        Get list of all supported currencies
        
        Returns:
            Response with list of currencies in format:
            {
                "currencies": [
                    {"code": "USD", "name": "US Dollar", "symbol": "$"},
                    {"code": "EUR", "name": "Euro", "symbol": "€"},
                    ...
                ]
            }
        """
        currencies_list = get_currencies_list()
        
        return Response(
            {
                "currencies": currencies_list,
                "count": len(currencies_list)
            },
            status=HTTP_200_OK
        )