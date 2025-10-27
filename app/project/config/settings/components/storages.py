from os import environ
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
            "hosts": [(config("REDIS_HOST", cast=str), config("REDIS_PORT", cast=int))],
        },
    },
}

# MinIO settings for media files only
MINIO_ENDPOINT = config("MINIO_ENDPOINT", default="mariami-minio-dev:9000")
MINIO_DOMAIN_URL = config("MINIO_DOMAIN_URL", default=None)
MINIO_ACCESS_KEY = config("MINIO_ACCESS_KEY", default="minioadmin")
MINIO_SECRET_KEY = config("MINIO_SECRET_KEY", default="minioadmin")
MINIO_USE_HTTPS = config("MINIO_USE_HTTPS", default=False, cast=bool)
MINIO_PRIVATE_BUCKETS = ["user-data"]

# Storage settings for Django - use local filesystem for static files
# DEFAULT_FILE_STORAGE = "config.storages.MinIOPrivateStorage"

# Private MinIO storage settings (for media files only)
MINIO_STORAGE_ENDPOINT = MINIO_ENDPOINT
MINIO_STORAGE_ACCESS_KEY = MINIO_ACCESS_KEY
MINIO_STORAGE_SECRET_KEY = MINIO_SECRET_KEY
MINIO_STORAGE_USE_HTTPS = MINIO_USE_HTTPS
MINIO_STORAGE_MEDIA_BUCKET_NAME = "user-data"
MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True

# Static files will be served locally, not from MinIO or GCS
# Use default Django staticfiles storage (local filesystem)
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# For media files, use MinIO storage (if needed)
# DEFAULT_FILE_STORAGE = "config.storages.MinIOPrivateStorage"
