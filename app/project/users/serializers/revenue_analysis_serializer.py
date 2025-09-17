from rest_framework import serializers


class RevenueAnalysisQuerySerializer(serializers.Serializer):
    """Serializer for validating revenue analysis query parameters"""
    
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


class RevenueAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for revenue analysis response"""
    
    period_type = serializers.CharField(
        help_text="Type of period used for analysis"
    )
    current_revenue = serializers.FloatField(
        help_text="Revenue for current period"
    )
    previous_revenue = serializers.FloatField(
        help_text="Revenue for previous period"
    )
    change = serializers.FloatField(
        help_text="Absolute change in revenue"
    )
    percentage_change = serializers.FloatField(
        help_text="Percentage change in revenue"
    )
    is_positive_change = serializers.BooleanField(
        help_text="Whether the change is positive"
    )
    currency = serializers.CharField(
        help_text="Currency code"
    )