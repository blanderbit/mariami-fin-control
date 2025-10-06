"""
Service for handling template file operations and public access.
"""
import logging
from typing import Dict, Optional
from urllib.parse import urljoin

from django.conf import settings
from django.core.cache import cache

from config.instances.minio_client import MINIO_CLIENT

logger = logging.getLogger(__name__)


class UserTemplatesService:
    """
    Service for managing user template files and providing public access links.
    Implements caching for optimal performance.
    """

    CACHE_TIMEOUT = 3600  # 1 hour cache
    TEMPLATES_BUCKET = "templates"
    
    # Available template files
    AVAILABLE_TEMPLATES = {
        "pnl": "pnl_template.csv",
        "transactions": "transactions_template.csv",
        "invoices": "invoices_template.csv"
    }

    def __init__(self):
        """Initialize service with MinIO client."""
        self.minio_client = MINIO_CLIENT

    def get_template_urls(self) -> Dict[str, str]:
        """
        Get public URLs for all available template files.
        Results are cached for performance.
        
        Returns:
            Dict[str, str]: Dictionary mapping template names to public URLs
        """
        cache_key = "template_urls_public"
        cached_urls = cache.get(cache_key)
        
        if cached_urls:
            logger.info("Retrieved template URLs from cache")
            return cached_urls

        urls = {}
        
        try:
            # Construct public URLs for templates bucket
            # Use MINIO_DOMAIN_URL if available, fallback to MINIO_ENDPOINT
            minio_domain = getattr(settings, 'MINIO_DOMAIN_URL', None)
            if not minio_domain:
                minio_endpoint = getattr(
                    settings, 'MINIO_ENDPOINT', 'localhost:9000'
                )
                minio_domain = f"http://{minio_endpoint}"
            
            base_url = f"{minio_domain}/{self.TEMPLATES_BUCKET}/"
            
            for template_name, filename in self.AVAILABLE_TEMPLATES.items():
                # Check if file exists in bucket
                if self._template_exists(filename):
                    urls[template_name] = urljoin(base_url, filename)
                    logger.info(f"Generated public URL for {template_name}")
                else:
                    logger.warning(f"Template file {filename} not found")
            
            # Cache the URLs
            cache.set(cache_key, urls, self.CACHE_TIMEOUT)
            logger.info(f"Cached template URLs for {self.CACHE_TIMEOUT}s")
            
        except Exception as e:
            logger.error(f"Error generating template URLs: {str(e)}")
            # Return empty dict on error
            urls = {}
        
        return urls

    def get_template_url(self, template_name: str) -> Optional[str]:
        """
        Get public URL for a specific template file.
        
        Args:
            template_name: Name of the template (pnl, transactions, invoices)
            
        Returns:
            Optional[str]: Public URL for the template or None if not found
        """
        if template_name not in self.AVAILABLE_TEMPLATES:
            logger.error(f"Unknown template name: {template_name}")
            return None
            
        cache_key = f"template_url_{template_name}"
        cached_url = cache.get(cache_key)
        
        if cached_url:
            logger.info(f"Retrieved {template_name} URL from cache")
            return cached_url
        
        try:
            filename = self.AVAILABLE_TEMPLATES[template_name]
            
            if self._template_exists(filename):
                # Use MINIO_DOMAIN_URL if available, fallback to MINIO_ENDPOINT
                minio_domain = getattr(settings, 'MINIO_DOMAIN_URL', None)
                if not minio_domain:
                    minio_endpoint = getattr(
                        settings, 'MINIO_ENDPOINT', 'localhost:9000'
                    )
                    minio_domain = f"http://{minio_endpoint}"
                
                bucket = self.TEMPLATES_BUCKET
                url = f"{minio_domain}/{bucket}/{filename}"
                
                # Cache the individual URL
                cache.set(cache_key, url, self.CACHE_TIMEOUT)
                logger.info(f"Generated and cached URL for {template_name}")
                return url
            else:
                logger.warning(f"Template file {filename} not found in bucket")
                return None
                
        except Exception as e:
            logger.error(f"Error generating URL for {template_name}: {str(e)}")
            return None

    def _template_exists(self, filename: str) -> bool:
        """
        Check if a template file exists in the templates bucket.
        
        Args:
            filename: Name of the file to check
            
        Returns:
            bool: True if file exists, False otherwise
        """
        try:
            # Try to get object info to check existence
            bucket = self.TEMPLATES_BUCKET
            self.minio_client.client.stat_object(bucket, filename)
            return True
        except Exception:
            # File doesn't exist or other error
            return False

    def refresh_cache(self) -> Dict[str, str]:
        """
        Force refresh of cached template URLs.
        
        Returns:
            Dict[str, str]: Fresh template URLs
        """
        # Clear cache
        cache.delete("template_urls_public")
        for template_name in self.AVAILABLE_TEMPLATES:
            cache.delete(f"template_url_{template_name}")
        
        logger.info("Cleared template URL cache")
        
        # Regenerate URLs
        return self.get_template_urls()

    def get_template_info(self) -> Dict[str, Dict[str, str]]:
        """
        Get detailed information about available templates.
        
        Returns:
            Dict: Template information with URLs and metadata
        """
        templates_info = {}
        urls = self.get_template_urls()
        
        for template_name, filename in self.AVAILABLE_TEMPLATES.items():
            templates_info[template_name] = {
                "filename": filename,
                "url": urls.get(template_name, ""),
                "available": template_name in urls,
                "description": self._get_template_description(template_name)
            }
        
        return templates_info

    def _get_template_description(self, template_name: str) -> str:
        """Get human-readable description for template."""
        descriptions = {
            "pnl": "Profit & Loss statement template with revenue",
            "transactions": "Transaction history template for income tracking",
            "invoices": "Invoice template for billing and payment tracking"
        }
        return descriptions.get(template_name, f"Template for {template_name}")