from typing import Union
from datetime import datetime
from config.tasks.send_ws_message import send_ws_message
from users.models import UserModel


def send_ws_message_to_user(
    message_type: str,
    user: UserModel,
    data: dict[str, Union[str, int, datetime, bool]] = None,
) -> None:
    send_ws_message(
        user=user,
        data={
            "type": "send.message",
            "message": {
                "message_type": message_type,
                "data": data,
            },
        },
    )
