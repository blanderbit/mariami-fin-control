from typing import Any, final
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
)
from django.db import models
from django.db.models.query import QuerySet
from rest_framework_simplejwt.tokens import (
    AccessToken,
    RefreshToken,
)


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

    email: str = models.EmailField(max_length=255, unique=True, db_index=True)
    is_verified: bool = models.BooleanField(default=False)
    is_admin: bool = models.BooleanField(default=False)
    is_onboarded: bool = models.BooleanField(default=False)
    created_at: str = models.DateTimeField(auto_now_add=True)
    updated_at: str = models.DateTimeField(auto_now=True)
    
    # Link to profile
    profile = models.OneToOneField(
        'profile.ProfileModel',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='user'
    )

    USERNAME_FIELD: str = "email"

    objects = UserModelManager()

    @staticmethod
    def bucket_name() -> str:
        return 'user-data'

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

    def update_onboarding_status(self) -> None:
        """
        Update the onboarding status based on profile completion
        """
        if self.profile and self.profile.is_onboarding_complete():
            self.is_onboarded = True
            self.save()

    class Meta:
        # the name of the table in the database for this model
        db_table: str = "user"
        verbose_name: str = "user"
        verbose_name_plural: str = "users"
        # sorting database records for this model by default
        ordering: list[str] = ["-id"]
