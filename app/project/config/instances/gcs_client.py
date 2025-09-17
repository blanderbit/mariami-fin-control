"""
Google Cloud Storage client for handling file operations
"""
import logging
from typing import Optional, List, BinaryIO
from google.cloud import storage
from google.cloud.exceptions import NotFound
from decouple import config

logger = logging.getLogger(__name__)


class GoogleCloudStorageClient:
    """Client for Google Cloud Storage operations"""
    
    def __init__(self):
        """Initialize the GCS client"""
        self.project_id = config('PROJECT_ID', default='')
        self.media_bucket_name = config('GCS_MEDIA_BUCKET', default='')
        self.static_bucket_name = config('GCS_STATIC_BUCKET', default='')
        
        # Initialize the client
        self.client = storage.Client(project=self.project_id)
        self.media_bucket = None
        self.static_bucket = None
        
        # Get bucket instances
        if self.media_bucket_name:
            try:
                self.media_bucket = self.client.bucket(self.media_bucket_name)
            except Exception as e:
                logger.error(f"Failed to initialize media bucket: {e}")
        
        if self.static_bucket_name:
            try:
                self.static_bucket = self.client.bucket(
                    self.static_bucket_name
                )
            except Exception as e:
                logger.error(f"Failed to initialize static bucket: {e}")

    def get_user_folder_path(self, user_id: int,
                             folder_type: str = "data_uploads") -> str:
        """
        Get the folder path for a user's files

        Args:
            user_id: User ID
            folder_type: Type of folder (data_uploads, profile_images, etc.)

        Returns:
            Folder path string
        """
        return f"user_{user_id}/{folder_type}"

    def upload_file(self, bucket_name: str, object_name: str,
                    file_data: BinaryIO, file_size: int,
                    content_type: str = None) -> bool:
        """
        Upload file to Google Cloud Storage
        
        Args:
            bucket_name: Name of the bucket
            object_name: Object name in the bucket
            file_data: File data to upload
            file_size: Size of the file
            content_type: MIME type of the file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get the appropriate bucket
            if bucket_name == self.media_bucket_name and self.media_bucket:
                bucket = self.media_bucket
            elif bucket_name == self.static_bucket_name and self.static_bucket:
                bucket = self.static_bucket
            else:
                bucket = self.client.bucket(bucket_name)
            
            # Create blob and upload
            blob = bucket.blob(object_name)
            
            if content_type:
                blob.content_type = content_type
            
            # Upload the file
            blob.upload_from_file(file_data)
            
            logger.info(f"File uploaded to GCS: {bucket_name}/{object_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upload file to GCS: {e}")
            return False
    
    def delete_file(self, bucket_name: str, object_name: str) -> bool:
        """
        Delete a file from Google Cloud Storage
        
        Args:
            bucket_name: Name of the bucket
            object_name: Object name in the bucket
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get the appropriate bucket
            if bucket_name == self.media_bucket_name and self.media_bucket:
                bucket = self.media_bucket
            elif bucket_name == self.static_bucket_name and self.static_bucket:
                bucket = self.static_bucket
            else:
                bucket = self.client.bucket(bucket_name)
            
            blob = bucket.blob(object_name)
            blob.delete()
            
            logger.info(f"File deleted from GCS: {bucket_name}/{object_name}")
            return True
            
        except NotFound:
            logger.warning(
                f"File not found in GCS: {bucket_name}/{object_name}"
            )
            return False
        except Exception as e:
            logger.error(f"Failed to delete file from GCS: {e}")
            return False

    def delete_user_files_by_template(self, user_id: int,
                                      template_type: str) -> bool:
        """
        Delete existing user files of a specific template type
        
        Args:
            user_id: User ID
            template_type: Template type to delete
            
        Returns:
            True if any files were deleted, False otherwise
        """
        try:
            if not self.media_bucket:
                logger.error("Media bucket not initialized")
                return False
            
            # Get user folder path
            user_folder = self.get_user_folder_path(user_id, "data_uploads")
            prefix = f"{user_folder}/{template_type}_"
            
            # List and delete files with the template prefix
            deleted_count = 0
            blobs = self.media_bucket.list_blobs(prefix=prefix)
            
            for blob in blobs:
                try:
                    blob.delete()
                    deleted_count += 1
                    logger.info(f"Deleted file: {blob.name}")
                except Exception as e:
                    logger.error(f"Failed to delete blob {blob.name}: {e}")
            
            if deleted_count > 0:
                logger.info(f"Deleted {deleted_count} files for user {user_id}, template {template_type}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete user files: {e}")
            return False
    
    def list_user_files(self, user_id: int, folder_type: str = "data_uploads") -> List[str]:
        """
        List files for a specific user
        
        Args:
            user_id: User ID
            folder_type: Type of folder to list
            
        Returns:
            List of file names
        """
        try:
            if not self.media_bucket:
                logger.error("Media bucket not initialized")
                return []
            
            user_folder = self.get_user_folder_path(user_id, folder_type)
            blobs = self.media_bucket.list_blobs(prefix=f"{user_folder}/")
            
            return [blob.name for blob in blobs]
            
        except Exception as e:
            logger.error(f"Failed to list user files: {e}")
            return []
    
    def get_file_url(self, bucket_name: str, object_name: str, 
                    expiration: int = 3600) -> Optional[str]:
        """
        Get a signed URL for a file
        
        Args:
            bucket_name: Name of the bucket
            object_name: Object name in the bucket
            expiration: URL expiration time in seconds
            
        Returns:
            Signed URL or None if failed
        """
        try:
            # Get the appropriate bucket
            if bucket_name == self.media_bucket_name and self.media_bucket:
                bucket = self.media_bucket
            elif bucket_name == self.static_bucket_name and self.static_bucket:
                bucket = self.static_bucket
            else:
                bucket = self.client.bucket(bucket_name)
            
            blob = bucket.blob(object_name)
            
            # Generate signed URL
            url = blob.generate_signed_url(expiration=expiration)
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate signed URL: {e}")
            return None
    
    def file_exists(self, bucket_name: str, object_name: str) -> bool:
        """
        Check if a file exists in Google Cloud Storage
        
        Args:
            bucket_name: Name of the bucket
            object_name: Object name in the bucket
            
        Returns:
            True if file exists, False otherwise
        """
        try:
            # Get the appropriate bucket
            if bucket_name == self.media_bucket_name and self.media_bucket:
                bucket = self.media_bucket
            elif bucket_name == self.static_bucket_name and self.static_bucket:
                bucket = self.static_bucket
            else:
                bucket = self.client.bucket(bucket_name)
            
            blob = bucket.blob(object_name)
            return blob.exists()
            
        except Exception as e:
            logger.error(f"Failed to check if file exists: {e}")
            return False


# Global instance
GCS_CLIENT = GoogleCloudStorageClient()