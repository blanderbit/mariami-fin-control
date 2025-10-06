"""
Service for handling document file operations and public access.
"""
import logging
import os
from typing import Dict, Optional
from urllib.parse import urljoin

from django.conf import settings
from django.core.cache import cache

from config.instances.minio_client import MINIO_CLIENT

logger = logging.getLogger(__name__)


class DocumentsService:
    """
    Service for managing document files and providing public access links.
    Implements caching for optimal performance.
    """

    CACHE_TIMEOUT = 3600  # 1 hour cache
    DOCUMENTS_BUCKET = "templates"  # Use same bucket as templates
    
    # Available document files
    AVAILABLE_DOCUMENTS = {
        "terms_of_service": "TermsOfService.md",
        "privacy_policy": "PrivacyPolicy.md"
    }

    def __init__(self):
        """Initialize service with MinIO client."""
        self.minio_client = MINIO_CLIENT
        self._ensure_documents_uploaded()

    def _ensure_documents_uploaded(self):
        """
        Ensure document files are uploaded to MinIO bucket.
        This runs on service initialization to sync local files with bucket.
        """
        try:
            for doc_name, filename in self.AVAILABLE_DOCUMENTS.items():
                local_file_path = self._get_local_file_path(doc_name)
                
                if os.path.exists(local_file_path):
                    # Check if file exists in bucket
                    if not self._document_exists(filename):
                        logger.info(f"Uploading {doc_name} to MinIO bucket")
                        self._upload_document_to_bucket(
                            local_file_path, filename
                        )
                    else:
                        logger.debug(
                            f"Document {doc_name} already exists in bucket"
                        )
                else:
                    logger.warning(
                        f"Local document file not found: {local_file_path}"
                    )
                    
        except Exception as e:
            logger.error(f"Error ensuring documents uploaded: {str(e)}")

    def _get_local_file_path(self, doc_name: str) -> str:
        """
        Get local file path for a document.
        
        Args:
            doc_name: Name of the document (terms_of_service, privacy_policy)
            
        Returns:
            str: Local file path
        """
        filename_mapping = {
            "terms_of_service": "TermsOfService.md",
            "privacy_policy": "PrivacyPolicy.md"
        }
        
        filename = filename_mapping.get(doc_name)
        if not filename:
            raise ValueError(f"Unknown document name: {doc_name}")
            
        return os.path.join(
            settings._BASE_DIR, 'docs', filename
        )

    def _upload_document_to_bucket(
        self, local_path: str, bucket_filename: str
    ):
        """
        Upload a document file to MinIO bucket.
        
        Args:
            local_path: Local file path
            bucket_filename: Filename to use in bucket
        """
        try:
            with open(local_path, 'rb') as file_data:
                file_size = os.path.getsize(local_path)
                
                self.minio_client.upload_file(
                    bucket_name=self.DOCUMENTS_BUCKET,
                    object_name=bucket_filename,
                    file_data=file_data,
                    file_size=file_size,
                    content_type='text/markdown',
                )
                
                logger.info(f"Successfully uploaded {bucket_filename}")
                
        except Exception as e:
            logger.error(f"Error uploading {bucket_filename}: {str(e)}")
            raise

    def get_document_urls(self) -> Dict[str, str]:
        """
        Get public URLs for all available document files.
        Results are cached for performance.
        
        Returns:
            Dict[str, str]: Dictionary mapping document names to public URLs
        """
        cache_key = "document_urls_public"
        cached_urls = cache.get(cache_key)
        
        if cached_urls:
            logger.info("Retrieved document URLs from cache")
            return cached_urls

        urls = {}
        
        try:
            # Get MINIO_DOMAIN_URL from settings, fallback to MINIO_ENDPOINT
            minio_domain = getattr(settings, 'MINIO_DOMAIN_URL', None)
            if not minio_domain:
                minio_endpoint = getattr(
                    settings, 'MINIO_ENDPOINT', 'localhost:9000'
                )
                minio_domain = f"http://{minio_endpoint}"
            
            base_url = f"{minio_domain}/{self.DOCUMENTS_BUCKET}/"
            
            for doc_name, filename in self.AVAILABLE_DOCUMENTS.items():
                # Check if file exists in bucket
                if self._document_exists(filename):
                    urls[doc_name] = urljoin(base_url, filename)
                    logger.info(f"Generated public URL for {doc_name}")
                else:
                    logger.warning(
                        f"Document file {filename} not found in bucket"
                    )
                    # Try to upload it again
                    try:
                        local_path = self._get_local_file_path(doc_name)
                        if os.path.exists(local_path):
                            self._upload_document_to_bucket(
                                local_path, filename
                            )
                            urls[doc_name] = urljoin(base_url, filename)
                    except Exception as e:
                        logger.error(
                            f"Failed to re-upload {doc_name}: {str(e)}"
                        )

            # Cache the URLs
            cache.set(cache_key, urls, self.CACHE_TIMEOUT)
            logger.info(f"Generated and cached {len(urls)} document URLs")
            
            return urls
            
        except Exception as e:
            logger.error(f"Error generating document URLs: {str(e)}")
            return {}

    def get_document_url(self, doc_name: str) -> Optional[str]:
        """
        Get public URL for a specific document file.
        
        Args:
            doc_name: Name of the document
            
        Returns:
            Optional[str]: Public URL for the document or None if not found
        """
        if doc_name not in self.AVAILABLE_DOCUMENTS:
            logger.error(f"Unknown document name: {doc_name}")
            return None
            
        cache_key = f"document_url_{doc_name}"
        cached_url = cache.get(cache_key)
        
        if cached_url:
            logger.info(f"Retrieved {doc_name} URL from cache")
            return cached_url
        
        try:
            filename = self.AVAILABLE_DOCUMENTS[doc_name]
            
            if self._document_exists(filename):
                # Get MINIO_DOMAIN_URL from settings
                minio_domain = getattr(settings, 'MINIO_DOMAIN_URL', None)
                if not minio_domain:
                    minio_endpoint = getattr(
                        settings, 'MINIO_ENDPOINT', 'localhost:9000'
                    )
                    minio_domain = f"http://{minio_endpoint}"
                
                bucket = self.DOCUMENTS_BUCKET
                url = f"{minio_domain}/{bucket}/{filename}"
                
                # Cache the individual URL
                cache.set(cache_key, url, self.CACHE_TIMEOUT)
                logger.info(f"Generated and cached URL for {doc_name}")
                return url
            else:
                logger.warning(
                    f"Document file {filename} not found in bucket"
                )
                return None
                
        except Exception as e:
            logger.error(f"Error generating URL for {doc_name}: {str(e)}")
            return None

    def _document_exists(self, filename: str) -> bool:
        """
        Check if a document file exists in the documents bucket.
        
        Args:
            filename: Name of the file to check
            
        Returns:
            bool: True if file exists, False otherwise
        """
        try:
            # Try to get object info to check existence
            bucket = self.DOCUMENTS_BUCKET
            self.minio_client.client.stat_object(bucket, filename)
            return True
        except Exception:
            # File doesn't exist or other error
            return False

    def refresh_cache(self) -> Dict[str, str]:
        """
        Force refresh of cached document URLs.
        
        Returns:
            Dict[str, str]: Fresh document URLs
        """
        # Clear cache
        cache.delete("document_urls_public")
        for doc_name in self.AVAILABLE_DOCUMENTS:
            cache.delete(f"document_url_{doc_name}")
        
        logger.info("Cleared document URL cache")
        
        # Regenerate URLs
        return self.get_document_urls()

    def get_document_info(self) -> Dict[str, Dict[str, str]]:
        """
        Get detailed information about available documents.
        
        Returns:
            Dict: Document information with URLs and metadata
        """
        documents_info = {}
        urls = self.get_document_urls()
        
        for doc_name, filename in self.AVAILABLE_DOCUMENTS.items():
            documents_info[doc_name] = {
                "filename": filename,
                "url": urls.get(doc_name, ""),
                "available": doc_name in urls,
                "description": self._get_document_description(doc_name)
            }
        
        return documents_info

    def _get_document_description(self, doc_name: str) -> str:
        """Get human-readable description for document."""
        descriptions = {
            "terms_of_service": "Terms of Service document",
            "privacy_policy": "Privacy Policy document"
        }
        return descriptions.get(doc_name, f"Document for {doc_name}")