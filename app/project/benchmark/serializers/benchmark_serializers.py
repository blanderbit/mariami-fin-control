"""
Serializers for benchmark API responses
"""
from rest_framework import serializers


class BenchmarkDataPointSerializer(serializers.Serializer):
    """Serializer for individual benchmark data points"""
    country = serializers.CharField(max_length=10)
    period = serializers.CharField(max_length=20)
    value = serializers.FloatField()
    indicator = serializers.CharField(max_length=50)
    unit = serializers.CharField(max_length=20)
    category = serializers.CharField(max_length=50)


class BenchmarkIndicatorSerializer(serializers.Serializer):
    """Serializer for benchmark indicator data"""
    indicator_key = serializers.CharField(source='*')
    data = BenchmarkDataPointSerializer(many=True)


class BenchmarkMarketOverviewSerializer(serializers.Serializer):
    """Serializer for complete market overview response"""
    last_update = serializers.CharField(allow_null=True, required=False)
    supported_countries = serializers.ListField(required=False)
    
    def to_representation(self, instance):
        """Custom representation to organize data by categories"""
        # Organize indicators by category
        macro_pulse = {}
        operating_pressure = {}
        
        # Process each indicator
        for key, value in instance.items():
            if key in ['last_update', 'supported_countries']:
                continue
                
            # Determine category from settings
            from django.conf import settings
            indicator_config = settings.OECD_INDICATORS.get(key, {})
            category = indicator_config.get('category', 'unknown')
            
            if category == 'macro_pulse':
                macro_pulse[key] = value
            elif category == 'operating_pressure':
                operating_pressure[key] = value
        
        return {
            'last_update': instance.get('last_update'),
            'macro_pulse': macro_pulse,
            'operating_pressure': operating_pressure,
            'supported_countries': instance.get('supported_countries', [])
        }