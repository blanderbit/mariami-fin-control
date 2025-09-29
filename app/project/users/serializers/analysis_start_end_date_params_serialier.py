
from rest_framework import serializers
from datetime import date


class StartAndEndDateParamsSerializer(serializers.Serializer):
    """Serializer for invoices analysis request parameters"""
    
    start_date = serializers.DateField(
        help_text="Start date for analysis period (YYYY-MM-DD)"
    )
    end_date = serializers.DateField(
        help_text="End date for analysis period (YYYY-MM-DD)"
    )

    def validate(self, data):
        """Validate date range"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError(
                    "start_date must be before or equal to end_date"
                )

            # Check if dates are not too far in the future
            today = date.today()
            if start_date > today:
                raise serializers.ValidationError(
                    "start_date cannot be in the future"
                )

        return data