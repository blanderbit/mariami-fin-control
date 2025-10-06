from decouple import config

# MinIO settings
MINIO_ENDPOINT = config("MINIO_ENDPOINT", default="mariami-minio-dev:9000")
MINIO_DOMAIN_URL = config("MINIO_DOMAIN_URL", default=None)
MINIO_ACCESS_KEY = config("MINIO_ACCESS_KEY", default="minioadmin")
MINIO_SECRET_KEY = config("MINIO_SECRET_KEY", default="minioadmin")
MINIO_USE_HTTPS = config("MINIO_USE_HTTPS", default=False, cast=bool)
MINIO_PRIVATE_BUCKETS = ["user-data"]

# Storage settings for Django
# DEFAULT_FILE_STORAGE = "config.storages.MinIOPrivateStorage"

# Private MinIO storage settings
MINIO_STORAGE_ENDPOINT = MINIO_ENDPOINT
MINIO_STORAGE_ACCESS_KEY = MINIO_ACCESS_KEY
MINIO_STORAGE_SECRET_KEY = MINIO_SECRET_KEY
MINIO_STORAGE_USE_HTTPS = MINIO_USE_HTTPS
MINIO_STORAGE_MEDIA_BUCKET_NAME = "user-data"
MINIO_STORAGE_AUTO_CREATE_MEDIA_BUCKET = True
MINIO_STORAGE_STATIC_BUCKET_NAME = "static"
MINIO_STORAGE_AUTO_CREATE_STATIC_BUCKET = True
