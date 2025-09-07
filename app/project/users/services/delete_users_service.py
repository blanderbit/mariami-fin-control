from users.models import UserModel
from config.types import BULK_RESPONSE


def delete_users_service(
    *, request_user: UserModel, ids_to_delete: list[int]
) -> BULK_RESPONSE:
    if request_user.is_admin:
        users_to_delete = UserModel.objects.filter(id__in=ids_to_delete)

        for user in users_to_delete:
            user_id = user.id
            user.delete()
            yield {"success": user_id}
