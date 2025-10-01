"""
Serializers for user templates API endpoints.
"""
from rest_framework import serializers


class TemplateListSerializer(serializers.Serializer):
    """
    Serializer for templates list response with all available templates.
    """
    pnl = serializers.URLField(
        help_text="Public URL for P&L template",
        allow_null=True,
        required=False
    )
    transactions = serializers.URLField(
        help_text="Public URL for transactions template",
        allow_null=True,
        required=False
    )
    invoices = serializers.URLField(
        help_text="Public URL for invoices template",
        allow_null=True,
        required=False
    )