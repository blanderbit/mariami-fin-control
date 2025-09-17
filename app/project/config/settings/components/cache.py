from decouple import config

# Django cache configuration using Redis
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': (
            f'redis://{config("REDIS_HOST", cast=str)}:'
            f'{config("REDIS_PORT", cast=int)}/1'
        ),
        'KEY_PREFIX': 'mariami_cache',
        'VERSION': 1,
        'TIMEOUT': 300,  # Default timeout 5 minutes
    }
}