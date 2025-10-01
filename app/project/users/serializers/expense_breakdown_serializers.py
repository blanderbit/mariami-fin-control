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


class ExpenseBreakdownResponseSerializer(serializers.Serializer):
    """Serializer for expense breakdown response"""
    
    COGS = ExpenseCategorySerializer(required=False)
    Payroll = ExpenseCategorySerializer(required=False)  
    Rent = ExpenseCategorySerializer(required=False)
    Marketing = ExpenseCategorySerializer(required=False)
    Other_Expenses = ExpenseCategorySerializer(required=False)
    
    class Meta:
        ref_name = "ExpenseBreakdownResponse"