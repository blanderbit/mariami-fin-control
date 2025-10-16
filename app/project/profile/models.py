from django.db import models
from typing import final
from django.contrib.postgres.fields import ArrayField
from djmoney.models.fields import MoneyField
from config.settings.components.currencies import (
    SUPPORTED_CURRENCIES, 
    DEFAULT_CURRENCY
)
from django.conf import settings


@final
class ProfileModel(models.Model):
    """
    Profile model for storing additional user information during onboarding
    """

    class UpdateFrequency(models.TextChoices):
        DAILY = "daily"
        WEEKLY = "weekly"
        MONTHLY = "monthly"
        OTHER = "other"

    class PrimaryFocus(models.TextChoices):
        CASH = "cash"
        PROFIT = "profit"
        GROWTH = "growth"

    class BusinessModelChoices(models.TextChoices):
        SUBSCRIPTION = "subscription"
        SERVICES = "services"
        HYBRID = "hybrid"
        ONE_TIME = "one_time"
        OTHER = "other"

    # Business settings - keeping old format for compatibility during migration

    # Required fields for completing onboarding
    REQUIRED_ONBOARDING_FIELDS = [
        "country",
        "currency",
        "industry",
        "fiscal_year_start",
        "update_frequency",
        "primary_focus",
        "business_model",
        "current_cash",
    ]

    # Personal information
    name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)

    # Company information
    company_name = models.CharField(max_length=255, null=True, blank=True)
    employees_count = models.PositiveIntegerField(null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)
    company_info = models.TextField(
        null=True, 
        blank=True, 
        help_text="Detailed description of the business"
    )

    # Financial settings
    currency = models.CharField(
        max_length=255,
        choices=SUPPORTED_CURRENCIES,
        null=True,
        blank=True,
        help_text="Primary business currency"
    )
    fiscal_year_start = models.DateField(
        null=True, blank=True, help_text="Fiscal year start date"
    )

    update_frequency = models.CharField(
        max_length=255, 
        choices=UpdateFrequency.choices, 
        null=True, 
        blank=True
    )

    primary_focus = ArrayField(
        models.CharField(max_length=255, choices=PrimaryFocus.choices),
        default=list,
        blank=True,
        help_text="Primary business focus areas (multi-select)"
    )

    business_model = ArrayField(
        models.CharField(max_length=255, choices=BusinessModelChoices.choices),
        default=list,
        blank=True,
        help_text="Business model types (multi-select)"
    )
    multicurrency = models.BooleanField(default=False)
    
    # Money fields
    capital_reserve_target = MoneyField(
        max_digits=15,
        decimal_places=2,
        default_currency=DEFAULT_CURRENCY,
        null=True,
        blank=True,
        help_text="Target amount for capital reserves"
    )
    
    current_cash = MoneyField(
        max_digits=15,
        decimal_places=2,
        default_currency=DEFAULT_CURRENCY,
        null=True,
        blank=True,
        help_text="Current cash available"
    )

    # AI-generated insights
    ai_insight = models.TextField(
        null=True,
        blank=True,
        help_text="AI-generated business insight based on profile data"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def oecd_country(self) -> str:
        return settings.SUPPORTED_COUNTRIES_DICT.get(self.country, {}).get('oecd_code', '')

    def is_onboarding_complete(self) -> bool:
        """
        Check if the onboarding is complete based on required fields
        """
        for field in self.REQUIRED_ONBOARDING_FIELDS:
            value = getattr(self, field)
            # For array fields, check if list is not empty
            if field in ['primary_focus', 'business_model']:
                if not value or len(value) == 0:
                    return False
            # For other fields, check if value exists
            elif not value:
                return False
        return True

    def __str__(self) -> str:
        return f"Profile {self.id}"

    class Meta:
        db_table = "profile"
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"
