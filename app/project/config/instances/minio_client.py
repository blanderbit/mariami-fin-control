from typing import Optional

from django.conf import settings
from minio import Minio
from minio.error import S3Error
from users.models import UserModel


class MinIOClient:
    """Singleton MinIO client"""

    _instance: Optional["MinIOClient"] = None
    _client: Optional[Minio] = None
    _initialized: bool = False

    def __new__(cls) -> "MinIOClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # Don't initialize immediately, wait for first access
        pass

    def _initialize_client(self):
        """Initialize MinIO client and create buckets"""
        if self._initialized:
            return

        try:
            self._client = Minio(
                endpoint=settings.MINIO_ENDPOINT,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=settings.MINIO_USE_HTTPS,
            )
            self._ensure_buckets_exist()
            self._initialized = True
            print(f"✅ MinIO client initialized: {settings.MINIO_ENDPOINT}")
        except Exception as e:
            print(f"❌ Failed to initialize MinIO client: {e}")
            raise

    @property
    def client(self) -> Minio:
        if not self._initialized:
            self._initialize_client()
        return self._client

    def _ensure_buckets_exist(self):
        """Create private buckets if they don't exist"""
        for bucket_name in settings.MINIO_PRIVATE_BUCKETS:
            try:
                if not self._client.bucket_exists(bucket_name):
                    self._client.make_bucket(bucket_name)
                    print(f"Created bucket: {bucket_name}")
                else:
                    print(f"Bucket already exists: {bucket_name}")
            except S3Error as e:
                print(f"Error creating bucket {bucket_name}: {e}")

    def get_user_folder_path(self, user_id: int, file_type: str = "") -> str:
        """Get user's private folder path"""
        base_path = f"user_{user_id}"
        if file_type:
            return f"{base_path}/{file_type}"
        return base_path

    def upload_file(
        self,
        bucket_name: str,
        object_name: str,
        file_data,
        file_size: int,
        content_type: str = None,
    ):
        """Upload file to MinIO"""
        if not self._initialized:
            self._initialize_client()

        try:
            result = self._client.put_object(
                bucket_name=bucket_name,
                object_name=object_name,
                data=file_data,
                length=file_size,
                content_type=content_type,
            )
            return result
        except S3Error as e:
            print(f"Error uploading file: {e}")
            raise

    def delete_file(self, bucket_name: str, object_name: str):
        """Delete file from MinIO"""
        if not self._initialized:
            self._initialize_client()

        try:
            self._client.remove_object(bucket_name, object_name)
            return True
        except S3Error as e:
            print(f"Error deleting file: {e}")
            return False

    def get_file_url(
        self, bucket_name: str, object_name: str, expires_in_seconds: int = 3600
    ) -> str:
        """Get presigned URL for file"""
        if not self._initialized:
            self._initialize_client()

        try:
            return self._client.presigned_get_object(
                bucket_name, object_name, expires=expires_in_seconds
            )
        except S3Error as e:
            print(f"Error getting file URL: {e}")
            raise

    def list_user_files(self, user_id: int, file_type: str = "") -> list:
        """List files in user's folder"""
        if not self._initialized:
            self._initialize_client()

        try:
            user_folder = self.get_user_folder_path(user_id, file_type)
            prefix = f"{user_folder}/" if file_type else f"{user_folder}/"

            objects = self._client.list_objects(
                bucket_name="user-data", prefix=prefix, recursive=True
            )
            return list(objects)
        except S3Error as e:
            print(f"Error listing user files: {e}")
            return []

    def delete_user_files_by_template(self, user_id: int, template_type: str) -> bool:
        """Delete existing files of specific template type for user"""
        if not self._initialized:
            self._initialize_client()

        try:
            user_folder = self.get_user_folder_path(user_id, "data_uploads")
            prefix = f"{user_folder}/{template_type}_"

            # List objects with the template prefix
            objects = self._client.list_objects(
                bucket_name="user-data", prefix=prefix, recursive=True
            )

            # Delete each object
            deleted_count = 0
            for obj in objects:
                self._client.remove_object("user-data", obj.object_name)
                deleted_count += 1
                print(f"Deleted: {obj.object_name}")

            return deleted_count > 0
        except S3Error as e:
            print(f"Error deleting user files: {e}")
            return False


# Global MinIO client instance
MINIO_CLIENT = MinIOClient()
