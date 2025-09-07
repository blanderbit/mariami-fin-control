import json
from typing import Any

from channels.generic.websocket import (
    AsyncWebsocketConsumer,
)
from django.utils import timezone


class GeneralConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        self.room_group_name = "general"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def send_message(self, event: dict[str, Any]) -> None:
        text_data: bytes = json.dumps(
            {"message": event["message"], "date_time": str(timezone.now())},
            ensure_ascii=False,
        ).encode("utf-8")

        await self.send(text_data.decode())
