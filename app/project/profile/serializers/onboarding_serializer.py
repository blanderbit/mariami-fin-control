from typing import Any
from profile.models import ProfileModel
from rest_framework.serializers import (
    ModelSerializer,
)


class OnboardingSerializer(ModelSerializer):
    """
    Serializer for onboarding process - allows partial updates
    """

    class Meta:
        model: ProfileModel = ProfileModel
        fields = [
            "name",
            "last_name",
            "country",
            "company_name",
            "employees_count",
            "industry",
            "currency",
            "fiscal_year_start",
            "update_frequency",
            "primary_focus",
            "business_model",
            "multicurrency",
            "capital_reserve_target",
        ]

    def update(
        self, instance: ProfileModel, validated_data: dict[str, Any]
    ) -> ProfileModel:
        """
        Update only the fields that are provided
        """
        for field, value in validated_data.items():
            if value is not None and value != "":
                setattr(instance, field, value)

        instance.save()

        # Update user's onboarding status
        # Find user who has this profile
        from users.models import UserModel

        try:
            user = UserModel.objects.get(profile=instance)
            user.update_onboarding_status()
        except UserModel.DoesNotExist:
            pass

        return instance
