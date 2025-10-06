"""
Serializers for industry norms API endpoints.
"""
from rest_framework import serializers


class IndustriesListSerializer(serializers.Serializer):
    """
    Serializer for industries list response.
    """
    industries = serializers.ListField(
        child=serializers.CharField(max_length=255),
        help_text="List of available industries from Industry_norms.csv"
    )


class IndustryDetailsSerializer(serializers.Serializer):
    """
    Serializer for individual industry details response.
    """
    industry = serializers.CharField(
        max_length=255,
        help_text="Industry name"
    )
    gross_margin_range = serializers.CharField(
        max_length=50,
        help_text="Gross margin range for the industry",
        allow_blank=True,
        required=False
    )
    operating_margin_range = serializers.CharField(
        max_length=50,
        help_text="Operating margin range for the industry",
        allow_blank=True,
        required=False
    )
    cash_buffer_target_months = serializers.CharField(
        max_length=50,
        help_text="Recommended cash buffer in months",
        allow_blank=True,
        required=False
    )
    dso_range = serializers.CharField(
        max_length=50,
        help_text="Days Sales Outstanding range",
        allow_blank=True,
        required=False
    )
    inventory_days_range = serializers.CharField(
        max_length=50,
        help_text="Inventory days range",
        allow_blank=True,
        required=False
    )
    expense_mix_notes = serializers.CharField(
        max_length=500,
        help_text="Notes about expense mix for the industry",
        allow_blank=True,
        required=False
    )
    notes = serializers.CharField(
        max_length=500,
        help_text="Additional notes about the industry",
        allow_blank=True,
        required=False
    )
    source_refs = serializers.CharField(
        max_length=200,
        help_text="Source references",
        allow_blank=True,
        required=False
    )