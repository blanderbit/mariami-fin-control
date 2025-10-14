# Benchmark app URL configuration
from django.urls import path
from .views import BenchmarkMarketOverviewView

app_name = 'benchmark'

urlpatterns = [
    path(
        'market-overview/',
        BenchmarkMarketOverviewView.as_view(),
        name='market_overview'
    ),
]