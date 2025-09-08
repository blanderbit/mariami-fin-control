from users.models import UserModel
from rest_framework.serializers import (
    ModelSerializer,
    Serializer,
    IntegerField,
)


class UserNewDataSerializer(ModelSerializer):

    class Meta:
        model: UserModel = UserModel
        fields = [
            "is_verified",
            "is_admin",
            "country",
        ]


class UpdateUserSerializer(Serializer):
    user_id = IntegerField(min_value=1)
    new_data = UserNewDataSerializer()

    class Meta:
        fields = ["user_id", "new_data"]
