from rest_framework import serializers

class ChangeDataSerializer(serializers.Serializer):
    """Serializer for change data (amount/percentage)"""
    
    change = serializers.FloatField(
        help_text="Absolute change value"
    )
    percentage_change = serializers.FloatField(
        help_text="Percentage change value"
    )


class InvoiceMetricsSerializer(serializers.Serializer):
    """Serializer for invoice metrics (count and amount)"""
    
    total_count = serializers.IntegerField(
        help_text="Total number of invoices"
    )
    total_amount = serializers.FloatField(
        help_text="Total amount of invoices"
    )


class InvoiceChangeMetricsSerializer(serializers.Serializer):
    """Serializer for invoice change metrics"""
    
    count_change = ChangeDataSerializer(
        help_text="Change in invoice count"
    )
    amount_change = ChangeDataSerializer(
        help_text="Change in invoice amount"
    )


class PeriodChangeSerializer(serializers.Serializer):
    """Serializer for period change data"""
    
    total_count = ChangeDataSerializer(
        help_text="Change in total invoice count"
    )
    paid_invoices = InvoiceChangeMetricsSerializer(
        help_text="Changes in paid invoices metrics"
    )
    overdue_invoices = InvoiceChangeMetricsSerializer(
        help_text="Changes in overdue invoices metrics"
    )


class PeriodInfoSerializer(serializers.Serializer):
    """Serializer for analysis period information"""
    
    start_date = serializers.DateField(
        help_text="Analysis period start date"
    )
    end_date = serializers.DateField(
        help_text="Analysis period end date"
    )


class InvoicesAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for invoices analysis response"""
    
    total_count = serializers.IntegerField(
        help_text="Total number of invoices in the period"
    )
    
    paid_invoices = InvoiceMetricsSerializer(
        help_text="Metrics for paid invoices"
    )
    
    overdue_invoices = InvoiceMetricsSerializer(
        help_text="Metrics for overdue invoices"
    )
    
    month_change = PeriodChangeSerializer(
        help_text="Month-over-month changes"
    )
    
    year_change = PeriodChangeSerializer(
        help_text="Year-over-year changes"
    )
    
    period = PeriodInfoSerializer(
        help_text="Analysis period information"
    )