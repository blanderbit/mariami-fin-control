from typing import Any, Optional

from asgiref.sync import async_to_sync
from users.models import UserModel
from channels.layers import get_channel_layer
from config.celery import celery

@celery.task(
    ignore_result=True,
    time_limit=5,
    soft_time_limit=3,
    default_retry_delay=5,
)
def send_ws_message(
    data: dict[str, Any], user: Optional[UserModel] = None, group_name: Optional[str] = None
) -> None:
    group_name_to_send: str = ""
    if user:
        group_name_to_send = user.group_name
    elif group_name:
        group_name_to_send = group_name
    async_to_sync(get_channel_layer().group_send)(group_name_to_send, data)