from rest_framework import serializers


class ExpenseCategorySerializer(serializers.Serializer):
    """Serializer for individual expense category data"""
    
    total_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total amount for this expense category"
    )
    spike = serializers.BooleanField(
        help_text="True if MoM > +20% or category ≥3% of total expenses"
    )
    new = serializers.BooleanField(
        help_text="True if category appeared first time in period"
    )
    monthly_change_percent = serializers.FloatField(
        help_text="Month-over-month change percentage"
    )