from rest_framework import serializers


class FinancialAnalysisQuerySerializer(serializers.Serializer):
    """Serializer for validating financial analysis query parameters"""
    
    PERIOD_CHOICES = [
        ('month', 'Month to Month'),
        ('year', 'Year to Year'),
    ]
    
    period = serializers.ChoiceField(
        choices=PERIOD_CHOICES,
        help_text=(
            "Analysis period: 'month' for month-to-month, "
            "'year' for year-to-year"
        )
    )


class FinancialMetricSerializer(serializers.Serializer):
    """Serializer for individual financial metric data"""
    
    current = serializers.FloatField(
        help_text="Value for current period"
    )
    previous = serializers.FloatField(
        help_text="Value for previous period"
    )
    change = serializers.FloatField(
        help_text="Absolute change between periods"
    )
    percentage_change = serializers.FloatField(
        help_text="Percentage change between periods"
    )
    is_positive_change = serializers.BooleanField(
        help_text="Whether the change is positive"
    )


class FinancialAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for comprehensive financial analysis response"""
    
    period_type = serializers.CharField(
        help_text="Type of period used for analysis (month/year)"
    )
    revenue_data = FinancialMetricSerializer(
        help_text="Revenue analysis data"
    )
    expenses_data = FinancialMetricSerializer(
        help_text="Expenses analysis data (sum of COGS, Payroll, etc.)"
    )
    net_profit_data = FinancialMetricSerializer(
        help_text="Net profit analysis data (revenue - expenses)"
    )
    currency = serializers.CharField(
        help_text="Currency code"
    )