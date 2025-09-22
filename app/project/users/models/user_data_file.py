from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserDataFile(models.Model):
    """Model to track user uploaded data files"""

    class TemplateType(models.TextChoices):
        PNL_TEMPLATE = "pnl_template"
        TRANSACTIONS_TEMPLATE = "transactions_template"
        INVOICES_TEMPLATE = "invoices_template"

    # Keep old format for compatibility during migration
    TEMPLATE_CHOICES = [
        ("pnl_template", "P&L Template"),
        ("transactions_template", "Transactions Template"),
        ("invoices_template", "Invoices Template"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="data_files")
    template_type = models.CharField(max_length=50, choices=TemplateType.choices)
    original_filename = models.CharField(max_length=255)
    stored_filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.PositiveIntegerField()  # Size in bytes
    upload_time = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "user_data_files"
        unique_together = ["user", "template_type", "is_active"]
        indexes = [
            models.Index(fields=["user", "template_type"]),
            models.Index(fields=["upload_time"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.template_type} - {self.original_filename}"

    @classmethod
    def deactivate_existing(cls, user, template_type):
        """Deactivate existing files of the same template type"""
        return cls.objects.filter(
            user=user, template_type=template_type, is_active=True
        ).update(is_active=False)
