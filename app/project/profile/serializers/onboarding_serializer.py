from typing import Any
from profile.models import ProfileModel
from rest_framework.serializers import (
    ModelSerializer,
    CharField,
    IntegerField,
    BooleanField,
    DecimalField,
    ChoiceField,
    DateField,
)


class OnboardingSerializer(ModelSerializer):
    """
    Serializer for onboarding process - allows partial updates
    """
    # Personal information
    name = CharField(max_length=255, required=False, allow_blank=True)
    last_name = CharField(max_length=255, required=False, allow_blank=True)
    country = CharField(max_length=255, required=False, allow_blank=True)
    
    # Company information
    company_name = CharField(max_length=255, required=False, allow_blank=True)
    employees_count = IntegerField(required=False, allow_null=True)
    industry = CharField(max_length=255, required=False, allow_blank=True)
    
    # Financial settings
    currency = CharField(max_length=10, required=False, allow_blank=True)
    fiscal_year_start = DateField(
        required=False,
        allow_null=True,
        help_text="Fiscal year start date"
    )
    
    # Business settings
    update_frequency = ChoiceField(
        choices=ProfileModel.UPDATE_FREQUENCY_CHOICES,
        required=False,
        allow_blank=True
    )
    primary_focus = ChoiceField(
        choices=ProfileModel.PRIMARY_FOCUS_CHOICES,
        required=False,
        allow_blank=True
    )
    business_model = CharField(
        max_length=255,
        required=False,
        allow_blank=True
    )
    multicurrency = BooleanField(required=False)
    capital_reserve_target = DecimalField(
        max_digits=15,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model: ProfileModel = ProfileModel
        fields = [
            'name',
            'last_name',
            'country',
            'company_name',
            'employees_count',
            'industry',
            'currency',
            'fiscal_year_start',
            'update_frequency',
            'primary_focus',
            'business_model',
            'multicurrency',
            'capital_reserve_target'
        ]

    def update(
        self, instance: ProfileModel, validated_data: dict[str, Any]
    ) -> ProfileModel:
        """
        Update only the fields that are provided
        """
        for field, value in validated_data.items():
            if value is not None and value != '':
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
