"""
OECD Data Service for fetching economic indicators
"""
import json
import logging
import requests
import pandas as pd
import time
from typing import Dict, List, Any, Optional
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class OECDDataService:
    """Service for fetching and processing OECD economic data"""
    
    def __init__(self):
        self.base_url = settings.OECD_BASE_URL
        self.supported_countries = [
            country['code'] for country in settings.BENCHMARK_SUPPORTED_COUNTRIES
        ]
        # Limit countries to avoid API limits
        self.countries_string = '+'.join(self.supported_countries)
        
    def fetch_oecd_series(self, url: str) -> List[Dict[str, Any]]:
        """
        Fetch and parse OECD data series from API
        
        Args:
            url: OECD API endpoint URL
            
        Returns:
            List of data records with country, period, and value
        """
        try:
            # Ensure proper format parameter
            if "?format=" not in url and "&format=" not in url:
                connector = "&" if "?" in url else "?"
                url += f"{connector}format=jsondata"
            
            logger.info(f"Fetching OECD data from: {url}")
            
            # Add retry logic for rate limiting
            max_retries = 1
            for attempt in range(max_retries):
                try:
                    response = requests.get(url, timeout=30)
                    response.raise_for_status()
                    break
                except requests.exceptions.HTTPError as e:
                    if response.status_code == 429:  # Too Many Requests
                        wait_time = (2 ** attempt) * 2  # Exponential backoff
                        logger.warning(
                            f"Rate limited. Retrying in {wait_time}s "
                            f"(attempt {attempt + 1}/{max_retries})"
                        )
                        time.sleep(wait_time)
                        if attempt == max_retries - 1:
                            raise e
                    else:
                        raise e
            
            data = response.json()
            
            # Debug: Log the response structure
            logger.info(f"Response data: {list(data)}")
            logger.info(f"Response keys: {list(data.keys())}")
            logger.info(f"Response values: {list(data.values())}")
            if 'data' in data:
                logger.info(f"Data keys: {list(data['data'].keys())}")
            
            # Check for different response formats
            if 'data' not in data:
                logger.error("Response missing 'data' key")
                return []
                
            if 'structure' not in data['data']:
                logger.error("Response missing 'structure' key in data")
                logger.info(f"Available data keys: {list(data['data'].keys())}")
                return []
            
            # Extract time dimensions
            structure = data['data']['structure']['dimensions']
            obs_time = [
                v['id'] for v in structure['observation'][0]['values']
            ]
            
            records = []
            
            # Check if datasets exist
            if 'dataSets' not in data['data'] or not data['data']['dataSets']:
                logger.warning(f"No dataSets found in response from {url}")
                return records
                
            datasets = data['data']['dataSets'][0]
            
            if 'series' not in datasets:
                logger.warning(f"No series data found in response from {url}")
                logger.info(f"Available dataset keys: {list(datasets.keys())}")
                return records
                
            # Process each data series
            for series_key, series_val in datasets['series'].items():
                # Extract country code from series key
                country_code = series_key.split(':')[0].split('.')[0]
                
                # Process observations - get latest value only
                if 'observations' in series_val:
                    observations = series_val['observations']
                    if observations:
                        # Get the latest observation (should be only one)
                        latest_obs_key = max(observations.keys())
                        latest_obs_val = observations[latest_obs_key]
                        
                        if (latest_obs_val and len(latest_obs_val) > 0 
                            and latest_obs_val[0] is not None):
                            records.append({
                                "country": country_code,
                                "period": obs_time[int(latest_obs_key)],
                                "value": float(latest_obs_val[0])
                            })
            
            logger.info(f"Successfully fetched {len(records)} records")
            return records
            
        except requests.RequestException as e:
            logger.error(f"Network error fetching OECD data: {str(e)}")
            return []
        except (KeyError, IndexError, ValueError) as e:
            logger.error(f"Data parsing error: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching OECD data: {str(e)}")
            return []
    
    def build_indicator_url(self, indicator_key: str) -> str:
        """
        Build OECD API URL for specific indicator
        
        Args:
            indicator_key: Key from OECD_INDICATORS settings
            
        Returns:
            Complete OECD API URL
        """
        indicator_config = settings.OECD_INDICATORS[indicator_key]
        endpoint = indicator_config['endpoint']
        query_template = indicator_config['query_template']
        
        # Format query with countries
        query = query_template.format(countries=self.countries_string)
        
        # Build complete URL with lastNObservations=1 to get only the latest data
        # This gets only the most recent available data point
        url = f"{self.base_url}/{endpoint}/{query}?lastNObservations=1"
        
        return url
    
    def fetch_single_country_indicator(self, indicator_key: str, country_code: str) -> List[Dict[str, Any]]:
        """
        Fetch data for a single indicator and single country (for testing)
        
        Args:
            indicator_key: Key from OECD_INDICATORS settings
            country_code: Single country code (e.g., 'GBR')
            
        Returns:
            List of data records for the indicator and country
        """
        try:
            indicator_config = settings.OECD_INDICATORS[indicator_key]
            endpoint = indicator_config['endpoint']
            query_template = indicator_config['query_template']
            
            # Format query with single country
            query = query_template.format(countries=country_code)
            
            # Build URL for latest observation only
            url = f"{self.base_url}/{endpoint}/{query}?lastNObservations=1"
            
            records = self.fetch_oecd_series(url)
            
            # Add indicator metadata to each record
            for record in records:
                record.update({
                    'indicator': indicator_key,
                    'unit': indicator_config['unit'],
                    'category': indicator_config['category']
                })
            
            return records
            
        except Exception as e:
            logger.error(
                f"Error fetching indicator '{indicator_key}' for {country_code}: {str(e)}"
            )
            return []

    def fetch_indicator_data(self, indicator_key: str) -> List[Dict[str, Any]]:
        """
        Fetch data for a specific economic indicator
        
        Args:
            indicator_key: Key from OECD_INDICATORS settings
            
        Returns:
            List of data records for the indicator
        """
        try:
            url = self.build_indicator_url(indicator_key)
            records = self.fetch_oecd_series(url)
            
            # Add indicator metadata to each record
            indicator_config = settings.OECD_INDICATORS[indicator_key]
            for record in records:
                record.update({
                    'indicator': indicator_key,
                    'unit': indicator_config['unit'],
                    'category': indicator_config['category']
                })
            
            return records
            
        except Exception as e:
            logger.error(
                f"Error fetching indicator '{indicator_key}': {str(e)}"
            )
            return []
    
    def fetch_all_indicators(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Fetch data for all configured indicators
        
        Returns:
            Dictionary with indicator keys and their data
        """
        all_data = {}
        
        for i, indicator_key in enumerate(settings.OECD_INDICATORS.keys()):
            logger.info(f"Fetching data for indicator: {indicator_key}")
            indicator_data = self.fetch_indicator_data(indicator_key)
            all_data[indicator_key] = indicator_data
            
            # Add delay between requests to avoid rate limiting
            if i < len(settings.OECD_INDICATORS) - 1:
                time.sleep(5)  # 5 second delay between requests
            
        return all_data
    
    def store_data_in_cache(self, all_data: Dict[str, List[Dict[str, Any]]]) -> None:
        """
        Store fetched data in Redis cache
        
        Args:
            all_data: Dictionary with all indicators data
        """
        try:
            cache_keys = settings.BENCHMARK_CACHE_KEYS
            
            # Store each indicator data
            for indicator_key, indicator_data in all_data.items():
                cache_key = cache_keys.get(indicator_key)
                if cache_key:
                    cache.set(
                        cache_key, 
                        json.dumps(indicator_data), 
                        timeout=86400  # 24 hours
                    )
                    logger.info(
                        f"Stored {len(indicator_data)} records for "
                        f"{indicator_key} in cache"
                    )
            
            # Store last update timestamp
            cache.set(
                cache_keys['last_update'], 
                pd.Timestamp.now().isoformat(),
                timeout=86400
            )
            
            logger.info("Successfully stored all benchmark data in cache")
            
        except Exception as e:
            logger.error(f"Error storing data in cache: {str(e)}")
    
    def get_cached_data(self) -> Dict[str, Any]:
        """
        Retrieve all benchmark data from cache
        
        Returns:
            Dictionary with all cached benchmark data
        """
        try:
            cache_keys = settings.BENCHMARK_CACHE_KEYS
            cached_data = {}
            
            # Retrieve each indicator data
            for indicator_key, cache_key in cache_keys.items():
                if indicator_key == 'last_update':
                    cached_data[indicator_key] = cache.get(cache_key)
                else:
                    raw_data = cache.get(cache_key)
                    if raw_data:
                        cached_data[indicator_key] = json.loads(raw_data)
                    else:
                        cached_data[indicator_key] = []
            
            return cached_data
            
        except Exception as e:
            logger.error(f"Error retrieving cached data: {str(e)}")
            return {}
    
    def update_all_benchmark_data(self) -> bool:
        """
        Fetch and cache all benchmark data
        
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("Starting benchmark data update...")
            
            # Fetch all indicators
            all_data = self.fetch_all_indicators()
            
            # Store in cache
            self.store_data_in_cache(all_data)
            
            logger.info("Benchmark data update completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error updating benchmark data: {str(e)}")
            return False