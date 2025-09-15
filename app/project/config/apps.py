from django.apps import AppConfig


class ConfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'config'
    
    def ready(self):
        # MinIO client will be initialized on first access
        # This prevents connection errors during app startup
        pass
