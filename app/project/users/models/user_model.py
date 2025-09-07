from typing import Any, final, Union
from decimal import Decimal
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
)
from django.db import models
from django.db.models.query import QuerySet
from djmoney.models.fields import MoneyField
from djmoney.models.managers import money_manager
from rest_framework_simplejwt.tokens import (
    AccessToken,
    RefreshToken,
)
from django.utils import timezone


class UserModelManager(BaseUserManager):
    @final
    def create_user(
        self, email: str, password: None = None, *agrs: Any, **kwargs: Any
    ) -> "UserModel":
        user = self.model(email=self.normalize_email(email), *agrs, **kwargs)
        user.set_password(password)
        user.save()
        return user


@final
class UserModel(AbstractBaseUser):

    class AccountType(models.TextChoices):
        WINNING: str = "winning"
        LOSING: str = "losing"

    email: str = models.EmailField(max_length=255, unique=True, db_index=True)
    is_verified: bool = models.BooleanField(default=False)
    is_admin: bool = models.BooleanField(default=False)
    created_at: str = models.DateTimeField(auto_now_add=True)
    balance: float = MoneyField(
        max_digits=9,
        decimal_places=2,
        default=0,
        default_currency="USD",
    )
    total_depsosit_sum: float = MoneyField(
        max_digits=9,
        decimal_places=2,
        default=0,
        default_currency="USD",
    )
    account_type: str = models.CharField(
        choices=AccountType.choices,
        max_length=10,
    )
    country: str = models.CharField(max_length=255, null=True, blank=True)
    time_started_winnin_account_after_deposit = models.DateTimeField(null=True)

    USERNAME_FIELD: str = "email"

    objects = money_manager(UserModelManager())

    def update_user_balance(self, balance: float, operator: str) -> None:
        from config.utils.send_ws_message_to_user import send_ws_message_to_user

        balance = Decimal(str(balance))

        if operator == "plus":
            self.balance.amount += balance
        elif operator == "minus":
            self.balance.amount -= balance
        elif operator == "replace":
            self.balance.amount = balance
        self.save()
        send_ws_message_to_user(
            "balance_update", self, {"new_balance": str(self.balance.amount)}
        )

    def update_total_depsosit_sum(self, amount: float) -> None:
        amount = Decimal(str(amount))
        self.total_depsosit_sum.amount += amount
        self.save()

    def calculated_win_change_depends_on_color(
        self, user_bet_color: str
    ) -> dict[str, int]:
        if user_bet_color == "red":
            return {
                "red": self.win_chance["red"],
                "black": 100 - self.win_chance["red"],
                "green": self.win_chance["green"],
            }
        elif user_bet_color == "black":
            return {
                "red": 100 - self.win_chance["black"],
                "black": self.win_chance["black"],
                "green": self.win_chance["green"],
            }
        elif user_bet_color == "green":
            return {
                "red": 100 - self.win_chance["green"],
                "black": 100 - self.win_chance["green"],
                "green": self.win_chance["green"],
            }

    @property
    def group_name(self) -> str:
        return "user_%s" % self.id

    def __repr__(self) -> str:
        return "<UserModel %s>" % self.id

    def __str__(self) -> str:
        return self.email

    @staticmethod
    def get_all() -> QuerySet["UserModel"]:
        """
        getting all records with optimized selection from the database
        """
        return UserModel.objects.all()

    def tokens(self) -> dict[str, str]:
        """
        generating jwt tokens for user object
        """
        refresh: RefreshToken = RefreshToken.for_user(self)
        access: AccessToken = AccessToken.for_user(self)
        return {"refresh": str(refresh), "access": str(access)}

    def save(self, *args, **kwargs):
        if (
            self.win_chance.get("red") >= 50
            and self.win_chance.get("red") >= 50
            and self.win_chance.get("red") >= 10
        ):
            self.account_type = self.AccountType.WINNING
        else:
            self.account_type = self.AccountType.LOSING
        super().save(*args, **kwargs)

    class Meta:
        # the name of the table in the database for this model
        db_table: str = "user"
        verbose_name: str = "user"
        verbose_name_plural: str = "users"
        # sorting database records for this model by default
        ordering: list[str] = ["-id"]
