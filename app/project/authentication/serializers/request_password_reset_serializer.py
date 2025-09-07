from rest_framework.serializers import (
    EmailField,
    Serializer,
)

class RequestPasswordResetSerializer(Serializer):
    email: str = EmailField(min_length=3, max_length=255)

    class Meta:
        fields = [
            "email",
        ]