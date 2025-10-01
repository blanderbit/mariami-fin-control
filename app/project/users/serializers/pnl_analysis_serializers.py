from rest_framework import serializers


class PNLAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for P&L analysis response"""
    
    class MonthChangeSerializer(serializers.Serializer):
        revenue = serializers.DictField(help_text="Revenue change data")
        expenses = serializers.DictField(help_text="Expenses change data") 
        net_profit = serializers.DictField(help_text="Net profit change data")
        
    class YearChangeSerializer(serializers.Serializer):
        revenue = serializers.DictField(help_text="Revenue change data")
        expenses = serializers.DictField(help_text="Expenses change data")
        net_profit = serializers.DictField(help_text="Net profit change data")
        
    class PeriodSerializer(serializers.Serializer):
        start_date = serializers.DateField(help_text="Analysis period start date")
        end_date = serializers.DateField(help_text="Analysis period end date")

    pnl_data = serializers.ListField(
        help_text="Raw P&L data for the period"
    )
    total_revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total revenue for the period"
    )
    total_expenses = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Total expenses for the period"
    )
    net_profit = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Net profit (revenue - expenses)"
    )
    gross_margin = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Gross margin percentage ((Revenue - COGS) / Revenue * 100)"
    )
    operating_margin = serializers.CharField(
        allow_null=True,
        help_text="Operating margin range from industry standards"
    )
    month_change = MonthChangeSerializer(help_text="Month-over-month changes")
    year_change = YearChangeSerializer(help_text="Year-over-year changes")
    period = PeriodSerializer(help_text="Analysis period information")
    ai_insights = serializers.ListField(
        child=serializers.CharField(),
        help_text="AI-generated business insights"
    )

    class Meta:
        ref_name = "PNLAnalysisResponse"