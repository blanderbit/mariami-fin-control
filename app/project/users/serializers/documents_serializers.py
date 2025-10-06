"""
Serializers for documents API endpoints.
"""
from rest_framework import serializers


class DocumentsListSerializer(serializers.Serializer):
    """
    Serializer for documents list response with available documents.
    """
    terms_of_service = serializers.URLField(
        help_text="Public URL for Terms of Service document",
        allow_null=True,
        required=False
    )
    privacy_policy = serializers.URLField(
        help_text="Public URL for Privacy Policy document",
        allow_null=True,
        required=False
    )