from authentication.permissions import (
    IsNotAuthenticatedPermission,
)
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from authentication.models import LoginAnalytics, RegisterAnalytics
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
)


class AuthAnalyticsView(GenericAPIView):
    """
    Login

    This endpoint allows a previously
    registered user to log in to the system.
    """

    def get(self, request: Request) -> Response:
        last_day = timezone.now()
        last_30_days = timezone.now() - timedelta(days=30)
        last_year = timezone.now() - timedelta(days=365)

        data = {
            "last_day_objects_login": LoginAnalytics.objects.filter(
                created_at__date=last_day
            ).count(),
            "last_30_days_objects_login": LoginAnalytics.objects.filter(
                created_at__date__gte=last_30_days
            ).count(),
            "last_year_objects_login": LoginAnalytics.objects.filter(
                created_at__date__gte=last_year
            ).count(),
            "all_time_objects_login": LoginAnalytics.objects.all().count(),
            "last_day_objects_register": RegisterAnalytics.objects.filter(
                created_at__date=last_day
            ).count(),
            "last_30_days_objects_register": RegisterAnalytics.objects.filter(
                created_at__date__gte=last_30_days
            ).count(),
            "last_year_objects_register": RegisterAnalytics.objects.filter(
                created_at__date__gte=last_year
            ).count(),
            "all_time_objects_register": RegisterAnalytics.objects.all().count(),
        }
        return Response(data, status=HTTP_200_OK)
