"""
Service for handling industry norms data operations.
"""
import logging
import os
import pandas as pd
from typing import List, Optional

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class IndustryNormsService:
    """
    Service for managing industry norms data from CSV file.
    Implements caching for optimal performance.
    """

    CACHE_TIMEOUT = 86400  # 24 hours cache (24 * 60 * 60)
    CACHE_KEY = "industry_norms_list"
    
    def __init__(self):
        """Initialize service."""
        self.file_path = self._get_industry_norms_file_path()

    def _get_industry_norms_file_path(self) -> str:
        """
        Get the absolute path to the Industry_norms.csv file.
        
        Returns:
            str: Absolute path to the industry norms file
        """
        # File location: app/project/templates/user_data/Industry_norms.csv
        return os.path.join(
            settings._BASE_DIR,
            'templates',
            'user_data',
            'Industry_norms.csv'
        )

    def get_industries_list(self) -> List[str]:
        """
        Get list of unique industries from the Industry_norms.csv file.
        Results are cached for 24 hours.
        
        Returns:
            List[str]: List of unique industry names
        """
        # Check cache first
        cached_industries = cache.get(self.CACHE_KEY)
        if cached_industries:
            logger.info("Retrieved industries list from cache")
            return cached_industries

        try:
            # Check if file exists
            if not os.path.exists(self.file_path):
                logger.error(
                    f"Industry norms file not found at: {self.file_path}"
                )
                return []

            # Read CSV file
            df = pd.read_csv(self.file_path)
            
            # Check if 'industry' column exists
            if 'industry' not in df.columns:
                logger.error(
                    "'industry' column not found in Industry_norms.csv"
                )
                return []

            # Get unique industry values and convert to list
            industries = df['industry'].dropna().unique().tolist()
            
            # Sort alphabetically for consistent output
            industries.sort()
            
            # Cache the result
            cache.set(self.CACHE_KEY, industries, self.CACHE_TIMEOUT)
            logger.info(f"Generated and cached {len(industries)} industries")
            
            return industries
            
        except pd.errors.EmptyDataError:
            logger.error("Industry norms CSV file is empty")
            return []
        except pd.errors.ParserError as e:
            logger.error(f"Error parsing Industry norms CSV file: {str(e)}")
            return []
        except Exception as e:
            logger.error(
                f"Unexpected error reading Industry norms file: {str(e)}"
            )
            return []

    def refresh_cache(self) -> List[str]:
        """
        Force refresh of cached industries list.
        
        Returns:
            List[str]: Fresh industries list
        """
        # Clear cache
        cache.delete(self.CACHE_KEY)
        logger.info("Cleared industries cache")
        
        # Regenerate list
        return self.get_industries_list()

    def get_industry_details(self, industry_name: str) -> Optional[dict]:
        """
        Get detailed information for a specific industry.
        
        Args:
            industry_name: Name of the industry
            
        Returns:
            Optional[dict]: Industry details or None if not found
        """
        try:
            if not os.path.exists(self.file_path):
                return None

            df = pd.read_csv(self.file_path)
            
            # Filter by industry name (case-insensitive)
            industry_data = df[
                df['industry'].str.lower() == industry_name.lower()
            ]
            
            if industry_data.empty:
                return None
                
            # Convert first matching row to dict and handle NaN values
            industry_dict = industry_data.iloc[0].to_dict()
            
            # Replace NaN values with None (which can be serialized to JSON)
            for key, value in industry_dict.items():
                if pd.isna(value):
                    industry_dict[key] = None
                elif (isinstance(value, (float, int)) and
                      not pd.isfinite(value)):
                    # Handle inf, -inf values
                    industry_dict[key] = None
                    
            return industry_dict
            
        except Exception as e:
            logger.error(
                f"Error getting industry details for {industry_name}: {str(e)}"
            )
            return None