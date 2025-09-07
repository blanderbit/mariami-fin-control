from rest_framework.serializers import (
    CharField,
    Serializer,
)


class LogoutSerializer(Serializer):
    refresh: str = CharField()

    class Meta:
        fields = [
            "refresh",
        ]
