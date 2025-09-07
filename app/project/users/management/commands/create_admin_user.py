from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from getpass import getpass


class Command(BaseCommand):
    help = "Create an admin user"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        email = input("Enter email: ")

        password = getpass("Enter password:")

        try:
            User.objects.get(email__iexact=email)
            raise ValidationError("User with this email already exists.")
        except User.DoesNotExist:
            pass

        try:
            User.objects.create_user(
                email=email, password=password, is_admin=True, is_verified=True
            )
            self.stdout.write(
                self.style.SUCCESS(f"Successfully created admin user: {email}")
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error creating admin user: {str(e)}"))
