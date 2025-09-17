# Google Cloud Storage configuration
import os
from decouple import config

# GCS settings for file storage
DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
STATICFILES_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'

# Google Cloud Storage settings
GS_PROJECT_ID = config('PROJECT_ID', default='')
GS_MEDIA_BUCKET_NAME = config('GCS_MEDIA_BUCKET', default='')
GS_STATIC_BUCKET_NAME = config('GCS_STATIC_BUCKET', default='')

# For media files
GS_BUCKET_NAME = GS_MEDIA_BUCKET_NAME
GS_DEFAULT_ACL = None  # Use bucket's default ACL
GS_FILE_OVERWRITE = False
GS_CUSTOM_ENDPOINT = None

# Static files configuration
STATICFILES_DIRS = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static'),
]

# URLs
if GS_MEDIA_BUCKET_NAME:
    MEDIA_URL = f'https://storage.googleapis.com/{GS_MEDIA_BUCKET_NAME}/'
else:
    MEDIA_URL = '/media/'

if GS_STATIC_BUCKET_NAME:
    STATIC_URL = f'https://storage.googleapis.com/{GS_STATIC_BUCKET_NAME}/'
else:
    STATIC_URL = '/static/'

# Security settings for GCS
GS_QUERYSTRING_AUTH = False  # Don't add query parameters to URLs
GS_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',  # 1 day cache
}

# For production, you might want different cache settings
if config('ENVIRONMENT', default='dev') == 'prod':
    GS_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=604800',  # 1 week cache for production
    }