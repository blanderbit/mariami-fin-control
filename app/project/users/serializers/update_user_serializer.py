from users.models import UserModel
from rest_framework.serializers import (
    ModelSerializer,
    Serializer,
    IntegerField,
)
from users.serializers.user_win_chance_serializer import UserWinChanceSerializer


class UserNewDataSerializer(ModelSerializer):
    win_chance = UserWinChanceSerializer()

    class Meta:
        model: UserModel = UserModel
        fields = [
            "is_verified",
            "is_admin",
            "win_chance",
            "account_type",
            "balance",
            "country",
        ]


class UpdateUserSerializer(Serializer):
    user_id = IntegerField(min_value=1)
    new_data = UserNewDataSerializer()

    class Meta:
        fields = ["user_id", "new_data"]
