# Benchmark app URL configuration
from django.urls import path
from .views.individual_views import (
    InflationBenchmarkView,
    ShortTermRateBenchmarkView,
    LongTermRateBenchmarkView,
    ConsumerConfidenceBenchmarkView,
    WageGrowthBenchmarkView,
    RentIndexBenchmarkView,
    EnergyUtilitiesBenchmarkView,
    TaxBurdenBenchmarkView,
    SupportedCountriesView
)

app_name = 'benchmark'

urlpatterns = [
    # Legacy market overview endpoint    
    path(
        'inflation/',
        InflationBenchmarkView.as_view(),
        name='inflation'
    ),
    path(
        'short-term-rate/',
        ShortTermRateBenchmarkView.as_view(),
        name='short_term_rate'
    ),
    path(
        'long-term-rate/',
        LongTermRateBenchmarkView.as_view(),
        name='long_term_rate'
    ),
    path(
        'consumer-confidence/',
        ConsumerConfidenceBenchmarkView.as_view(),
        name='consumer_confidence'
    ),
    path(
        'wage-growth/',
        WageGrowthBenchmarkView.as_view(),
        name='wage_growth'
    ),
    path(
        'rent-index/',
        RentIndexBenchmarkView.as_view(),
        name='rent_index'
    ),
    path(
        'energy-utilities/',
        EnergyUtilitiesBenchmarkView.as_view(),
        name='energy_utilities'
    ),
    path(
        'tax-burden/',
        TaxBurdenBenchmarkView.as_view(),
        name='tax_burden'
    ),
    
    # Utility endpoints
    path(
        'countries/',
        SupportedCountriesView.as_view(),
        name='supported_countries'
    ),
]