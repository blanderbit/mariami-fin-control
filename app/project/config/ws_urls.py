from django.urls import path
from config.consumers import (
    GeneralConsumer,
    UserConsumer,
)

websocket_urlpatterns = [
    path("ws/messages/", UserConsumer.as_asgi(), name="user-messages"),
    path("ws/general/", GeneralConsumer.as_asgi(), name="general"),
]
