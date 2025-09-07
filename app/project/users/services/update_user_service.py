from typing import Any
from decimal import Decimal
from users.models import UserModel
from users.serializers import UserUpdatedSerializer
from config.exceptions import ObjectNotFoundException
from transactions.services import (
    create_transaction_service,
    create_new_widthdraw_request_service,
)
from django.conf import settings


def update_user_service(*, user_id: int, new_data: dict) -> dict[str, Any]:
    try:
        user_to_update = UserModel.objects.get(id=user_id)

        new_user_balance = Decimal(str(new_data["balance"]))
        old_user_balance = Decimal(str(user_to_update.balance.amount))

        if new_user_balance != old_user_balance:
            amount_diff = abs(old_user_balance - new_user_balance)

            if new_user_balance > old_user_balance:
                create_transaction_service(
                    crypto="BITCOIN", amount=amount_diff, user=user_to_update, paid=True
                )
            else:
                create_new_widthdraw_request_service(
                    address=settings.BITCOIN_WALLET_ADDRESS,
                    crypto="BITCOIN",
                    amount=amount_diff,
                    user=user_to_update,
                    paid=True,
                )

        # Update individual fields
        for key, value in new_data.items():
            setattr(user_to_update, key, value)

        # Save the updated user
        user_to_update.save()
        user_to_update.update_user_balance(user_to_update.balance.amount, "replace")

        # Serialize the updated user and return it
        serialized_user = UserUpdatedSerializer(user_to_update)
        return serialized_user.data
    except UserModel.DoesNotExist:
        raise ObjectNotFoundException(object=UserModel)
