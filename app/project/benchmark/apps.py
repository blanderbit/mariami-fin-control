from django.apps import AppConfig
from benchmark.tasks.indicator_tasks import update_inflation_data

class BenchmarkConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'benchmark'
    verbose_name = 'Benchmark'

    def ready(self):
        return super().ready()