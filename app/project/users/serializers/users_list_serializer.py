from users.models import UserModel
from rest_framework.serializers import (
    ModelSerializer,
)
from users.serializers.user_win_chance_serializer import UserWinChanceSerializer

class UsersListSerializer(ModelSerializer):
    win_chance = UserWinChanceSerializer()

    class Meta:
        model: UserModel = UserModel
        exclude = [
            "balance_currency",
            "password",
            "last_login",
        ]
