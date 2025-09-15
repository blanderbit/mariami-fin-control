from typing import Any

from decouple import config

DATABASES: dict[str, Any] = {
    "default": {
        "ENGINE": config("DB_ENGINE", cast=str),
        "NAME": config("POSTGRES_DB", cast=str),
        "USER": config("POSTGRES_USER", cast=str),
        "PASSWORD": config("POSTGRES_PASSWORD", cast=str),
        "HOST": config("POSTGRES_HOST", cast=str),
        "PORT": config("POSTGRES_PORT", cast=int),
    }
}
CHANNEL_LAYERS: dict[str, Any] = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [
                (config("REDIS_HOST", cast=str), config("REDIS_PORT", cast=int))
            ],
        },
    },
}
