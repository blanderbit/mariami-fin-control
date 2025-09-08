from collections import OrderedDict
from typing import Any
from users.models import UserModel
from rest_framework.serializers import (
    CharField,
    ModelSerializer,
)


class RegistrationSerializer(ModelSerializer):
    password: str = CharField(max_length=68, min_length=8, write_only=True)
    re_password: str = CharField(max_length=68, min_length=8, write_only=True)

    class Meta:
        model: UserModel = UserModel
        fields = ["email", "password", "re_password", "country", "name", "last_name"]

    def validate(self, attrs: OrderedDict[str, Any]) -> OrderedDict[str, Any]:
        # password: str = attrs.get("password", "")
        # re_password: str = attrs.get("re_password", "")

        # if password != re_password:
        #     raise ValidationError(PASSWORDS_DO_NOT_MATCH_ERROR, HTTP_400_BAD_REQUEST)
        return attrs

    def create(self, validated_data: dict[str, Any]) -> UserModel:
        validated_data.pop("re_password")

        return UserModel.objects.create_user(**validated_data)
