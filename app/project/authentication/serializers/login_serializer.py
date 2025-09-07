from collections import OrderedDict
from typing import Union

from authentication.models import LoginAnalytics
from users.models import UserModel
from rest_framework.serializers import (
    CharField,
    EmailField,
    ModelSerializer,
    SerializerMethodField,
    ValidationError,
)
from authentication.constants.errors import (
    INVALID_CREDENTIALS_ERROR,
)
from django.contrib import auth
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
)


class LoginSerializer(ModelSerializer):
    email: str = EmailField(min_length=3, max_length=255)
    password: str = CharField(min_length=8, max_length=68, write_only=True)

    tokens = SerializerMethodField()

    def get_tokens(self, obj) -> dict[str, str]:
        user: UserModel = UserModel.objects.get(email__iexact=obj["email"])
        return user.tokens()

    def validate(
        self, attrs: OrderedDict
    ) -> Union[ValidationError, dict[str, str], OrderedDict]:
        """data validation function for user authorization"""
        email: str = attrs.get("email", "")
        password: str = attrs.get("password", "")
        user: UserModel = auth.authenticate(email=email, password=password)
        if not user:
            raise ValidationError(INVALID_CREDENTIALS_ERROR, HTTP_400_BAD_REQUEST)
        LoginAnalytics.objects.create()
        return {"email": user.email, "tokens": user.tokens}

        return super().validate(attrs)

    class Meta:
        model: UserModel = UserModel
        fields = [
            "email",
            "password",
            "tokens",
        ]
