from typing import Union
from datetime import datetime
from config.tasks.send_ws_message import send_ws_message


def send_ws_message_to_general_layer(
    message_type: str,
    data: dict[str, Union[str, int, datetime, bool]] = None,
) -> None:
    group_name_to_send: str = "general"

    send_ws_message(
        group_name=group_name_to_send,
        data={
            "type": "send.message",
            "message": {
                "message_type": message_type,
                "data": data,
            },
        },
    )
