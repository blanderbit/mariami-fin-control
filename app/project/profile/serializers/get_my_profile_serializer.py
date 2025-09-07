from users.models import UserModel
from rest_framework.serializers import (
    ModelSerializer,
)


class GetMyProfileSerializer(ModelSerializer):
    class Meta:
        model: UserModel = UserModel
        fields = ["id", "email", "is_verified", "is_admin", "balance", "country"]
