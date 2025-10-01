from rest_framework import serializers


class AIInsightsResponseSerializer(serializers.Serializer):
    """Serializer for AI insights response"""

    insights = serializers.ListField(
        child=serializers.CharField(max_length=200),
        min_length=4,
        max_length=4,
        help_text="List of exactly 4 AI-generated business insights"
    )
    
    period = serializers.DictField(
        help_text="Analysis period information"
    )
    
    data_sources = serializers.DictField(
        help_text="Available data sources used for analysis"
    )

    class Meta:
        ref_name = "AIInsightsResponse"