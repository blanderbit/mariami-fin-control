from django.core.management.base import BaseCommand
from config.instances.minio_client import MINIO_CLIENT


class Command(BaseCommand):
    help = 'Test MinIO connection and bucket creation'

    def handle(self, *args, **options):
        self.stdout.write('Testing MinIO connection...')
        
        try:
            # This will trigger initialization
            client = MINIO_CLIENT.client
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Successfully connected to MinIO at {client._base_url}'
                )
            )
            
            # List buckets
            buckets = list(client.list_buckets())
            self.stdout.write(f'Found {len(buckets)} buckets:')
            for bucket in buckets:
                self.stdout.write(f'  - {bucket.name}')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to connect to MinIO: {e}')
            )
