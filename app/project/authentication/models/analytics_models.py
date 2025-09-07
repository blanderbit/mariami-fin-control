from datetime import datetime
from typing import Optional, final

from django.db import models
from django.db.models.query import QuerySet
from django.utils import timezone


@final
class LoginAnalytics(models.Model):
    created_at: str = models.DateTimeField(auto_now_add=True)

    def __repr__(self) -> str:
        return "<LoginAnalytics %s>" % self.id

    def __str__(self) -> str:
        return self.created_at

    class Meta:
        db_table: str = "login_analytics"
        verbose_name: str = "login_analytics"
        verbose_name_plural: str = "login_analytics"


@final
class RegisterAnalytics(models.Model):
    created_at: str = models.DateTimeField(auto_now_add=True)

    def __repr__(self) -> str:
        return "<LoginAnalytics %s>" % self.id

    def __str__(self) -> str:
        return self.created_at

    class Meta:
        db_table: str = "register_analytics"
        verbose_name: str = "register_analytics"
        verbose_name_plural: str = "register_analytics"
