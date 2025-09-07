from rest_framework.serializers import (
    CharField,
    Serializer,
)

class RequestChangePasswordSerializer(Serializer):
    new_password: str = CharField(min_length=8, max_length=68)
    old_password: str = CharField(min_length=8, max_length=68)

    class Meta:
        fields = [
            "new_password",
            "old_password",
        ]