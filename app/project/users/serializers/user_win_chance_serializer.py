from rest_framework.serializers import (
    Serializer,
    IntegerField
)

class UserWinChanceSerializer(Serializer):
    red = IntegerField(min_value=0, max_value=100)
    black = IntegerField(min_value=0, max_value=100)
    green = IntegerField(min_value=0, max_value=100)

    class Meta:
        fields = [
            "red",
            "black",
            "green"
        ]