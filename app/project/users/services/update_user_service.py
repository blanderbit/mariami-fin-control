from typing import Any
from users.models import UserModel
from users.serializers import UserUpdatedSerializer
from config.exceptions import ObjectNotFoundException


def update_user_service(*, user_id: int, new_data: dict) -> dict[str, Any]:
    try:
        user_to_update = UserModel.objects.get(id=user_id)

        # Update individual fields
        for key, value in new_data.items():
            setattr(user_to_update, key, value)

        # Save the updated user
        user_to_update.save()

        # Serialize the updated user and return it
        serialized_user = UserUpdatedSerializer(user_to_update)
        return serialized_user.data
    except UserModel.DoesNotExist:
        raise ObjectNotFoundException(object=UserModel)
