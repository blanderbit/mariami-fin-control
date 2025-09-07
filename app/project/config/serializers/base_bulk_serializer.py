from rest_framework.serializers import (
    IntegerField,
    ListField,
    Serializer,
)


class BaseBulkSerializer(Serializer):
    ids = ListField(child=IntegerField(min_value=0))

    class Meta:
        fields = [
            "ids",
        ]
