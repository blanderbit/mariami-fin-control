from rest_framework import serializers


class CashAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for cash analysis response"""

    total_income = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total income from transactions"
    )
    total_expense = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total expense from transactions"
    )

    class Meta:
        ref_name = "CashAnalysisResponse"