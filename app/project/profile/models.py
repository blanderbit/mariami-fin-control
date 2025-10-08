from django.db import models
from typing import final
from djmoney.models.fields import MoneyField
from config.settings.components.currencies import (
    SUPPORTED_CURRENCIES, 
    DEFAULT_CURRENCY
)


@final
class ProfileModel(models.Model):
    """
    Profile model for storing additional user information during onboarding
    """

    class UpdateFrequency(models.TextChoices):
        DAILY = "daily"
        WEEKLY = "weekly"
        MONTHLY = "monthly"

    class PrimaryFocus(models.TextChoices):
        CASH = "cash"
        PROFIT = "profit"
        GROWTH = "growth"

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
        max_length=10,
        choices=SUPPORTED_CURRENCIES,
        null=True,
        blank=True,
        help_text="Primary business currency"
    )
    fiscal_year_start = models.DateField(
        null=True, blank=True, help_text="Fiscal year start date"
    )

    update_frequency = models.CharField(
        max_length=10, 
        choices=UpdateFrequency.choices, 
        null=True, 
        blank=True
    )

    primary_focus = models.CharField(
        max_length=10, 
        choices=PrimaryFocus.choices, 
        null=True, 
        blank=True
    )

    business_model = models.CharField(max_length=255, null=True, blank=True)
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

    def is_onboarding_complete(self) -> bool:
        """
        Check if the onboarding is complete based on required fields
        """
        for field in self.REQUIRED_ONBOARDING_FIELDS:
            if not getattr(self, field):
                return False
        return True

    def __str__(self) -> str:
        return f"Profile {self.id}"

    class Meta:
        db_table = "profile"
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"
