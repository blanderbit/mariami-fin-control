from users.models import UserModel
from rest_framework.serializers import (
    ModelSerializer,
)

class UsersListSerializer(ModelSerializer):

    class Meta:
        model: UserModel = UserModel
        exclude = [
            "password",
        ]
