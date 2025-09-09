from django.db import models
from typing import final


@final
class ProfileModel(models.Model):
    """
    Profile model for storing additional user information during onboarding
    """

    # Business settings
    UPDATE_FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
    ]

    PRIMARY_FOCUS_CHOICES = [
        ("cash", "Cash"),
        ("profit", "Profit"),
        ("growth", "Growth"),
    ]

    # Required fields for completing onboarding
    REQUIRED_ONBOARDING_FIELDS = [
        "country",
        "currency",
        "industry",
        "fiscal_year_start",
        "update_frequency",
        "primary_focus",
        "business_model",
    ]

    # Personal information
    name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True)

    # Company information
    company_name = models.CharField(max_length=255, null=True, blank=True)
    employees_count = models.PositiveIntegerField(null=True, blank=True)
    industry = models.CharField(max_length=255, null=True, blank=True)

    # Financial settings
    currency = models.CharField(max_length=10, null=True, blank=True)
    fiscal_year_start = models.DateField(
        null=True, blank=True, help_text="Fiscal year start date"
    )

    update_frequency = models.CharField(
        max_length=10, choices=UPDATE_FREQUENCY_CHOICES, null=True, blank=True
    )

    primary_focus = models.CharField(
        max_length=10, choices=PRIMARY_FOCUS_CHOICES, null=True, blank=True
    )

    business_model = models.CharField(max_length=255, null=True, blank=True)
    multicurrency = models.BooleanField(default=False)
    capital_reserve_target = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
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
