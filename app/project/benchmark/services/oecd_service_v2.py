"""
OECD Data Service - Refactored with individual indicator functions
"""
import json
import logging
import requests
import pandas as pd
from typing import Dict, List, Any, Optional
from django.core.cache import cache

logger = logging.getLogger(__name__)


class OECDDataService:
    """Service for fetching OECD economic indicators with individual functions"""
    
    def __init__(self):
        self.base_url = "https://sdmx.oecd.org/public/rest/data"
        # Limited countries to avoid API rate limits
        self.countries = ["USA", "GBR", "DEU", "FRA"]
        self.countries_string = '+'.join(self.countries)
    
    def _fetch_latest_oecd_data(self, endpoint: str, query: str, 
                               indicator_key: str, unit: str, category: str) -> List[Dict[str, Any]]:
        """
        Common function to fetch latest OECD data for any indicator
        
        Args:
            endpoint: OECD API endpoint
            query: Query string with country placeholders
            indicator_key: Unique identifier for the indicator
            unit: Unit of measurement
            category: Category (macro_pulse or operating_pressure)
            
        Returns:
            List of latest data records
        """
        try:
            # Format query with countries
            formatted_query = query.format(countries=self.countries_string)
            
            # Build URL to get only latest observation in JSON format
            url = f"{self.base_url}/{endpoint}/{formatted_query}?lastNObservations=1&format=jsondata"
            
            logger.info(f"Fetching {indicator_key} from: {url}")
            
            # Make request with timeout and JSON headers
            headers = {
                'Accept': 'application/json',
                'User-Agent': 'MariaMi-FinControl/1.0'
            }
            response = requests.get(url, timeout=30, headers=headers)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '')
            if 'json' not in content_type.lower():
                logger.warning(f"Non-JSON response for {indicator_key}: {content_type}")
                logger.debug(f"Response text: {response.text[:500]}")
            
            try:
                data = response.json()
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON for {indicator_key}: {e}")
                logger.debug(f"Response text: {response.text[:500]}")
                return []

            logger.debug(f"Response structure for {indicator_key}: {list(data.keys())}")
            
            # Validate response structure
            if 'data' not in data:
                logger.error(f"No 'data' key in response for {indicator_key}")
                return []
                
            if ('structures' not in data['data'] or 
                'dataSets' not in data['data'] or 
                not data['data']['dataSets'] or
                not data['data']['structures']):
                logger.warning(f"Invalid data structure for {indicator_key}")
                return []
            
            # Extract time dimensions from the correct location
            structure = data['data']['structures'][0]['dimensions']
            obs_time = [v['id'] for v in structure['observation'][0]['values']]
            
            # Process dataset
            datasets = data['data']['dataSets'][0]
            if 'series' not in datasets:
                logger.warning(f"No series data for {indicator_key}")
                return []
            
            records = []
            
            # Create country mapping from structure dimensions
            country_dimension = None
            for dim in structure['series']:
                if dim['id'] == 'REF_AREA':
                    country_dimension = dim
                    break
            
            if not country_dimension:
                logger.warning(f"No REF_AREA dimension found for {indicator_key}")
                return []
            
            country_mapping = {
                str(idx): country['id'] 
                for idx, country in enumerate(country_dimension['values'])
            }
            
            # Process each country's data
            for series_key, series_val in datasets['series'].items():
                # Parse series key (format like "3:0:0")
                key_parts = series_key.split(':')
                if len(key_parts) < 1:
                    continue
                    
                country_idx = key_parts[0]
                country_code = country_mapping.get(country_idx)
                
                if not country_code:
                    logger.debug(f"Unknown country index {country_idx} in series {series_key}")
                    continue
                
                if 'observations' in series_val and series_val['observations']:
                    # Get the latest observation (should be only one)
                    latest_obs_key = max(series_val['observations'].keys())
                    latest_obs_val = series_val['observations'][latest_obs_key]
                    
                    if (latest_obs_val and len(latest_obs_val) > 0 and
                            latest_obs_val[0] is not None):
                        records.append({
                            "country": country_code,
                            "period": obs_time[int(latest_obs_key)],
                            "value": float(latest_obs_val[0]),
                            "indicator": indicator_key,
                            "unit": unit,
                            "category": category
                        })
            
            logger.info(f"Successfully fetched {len(records)} records for {indicator_key}")
            return records
            
        except requests.RequestException as e:
            logger.error(f"Network error fetching {indicator_key}: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error fetching {indicator_key}: {str(e)}")
            return []
    
    def _cache_indicator_data(self, indicator_key: str, data: List[Dict[str, Any]]) -> None:
        """
        Cache indicator data in Redis
        
        Args:
            indicator_key: Unique identifier for the indicator
            data: List of data records to cache
        """
        try:
            cache_key = f"benchmark:{indicator_key}"
            cache.set(cache_key, json.dumps(data), timeout=86400)  # 24 hours
            
            # Update last update timestamp for this indicator
            timestamp_key = f"benchmark:{indicator_key}:last_update"
            cache.set(timestamp_key, pd.Timestamp.now().isoformat(), timeout=86400)
            
            logger.info(f"Cached {len(data)} records for {indicator_key}")
            
        except Exception as e:
            logger.error(f"Error caching {indicator_key}: {str(e)}")
    
    # Individual indicator fetch functions
    
    def fetch_oecd_inflation(self) -> List[Dict[str, Any]]:
        """Fetch latest inflation (CPI) data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0",
            query="{countries}.M.N.CPI.._T..GY+_Z",
            indicator_key="inflation",
            unit="%",
            category="macro_pulse"
        )
    
    def fetch_oecd_short_term_rate(self) -> List[Dict[str, Any]]:
        """Fetch latest short-term interest rate data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.STES,DSD_KEI@DF_KEI,4.0",
            query="{countries}.M.IR3TIB.PA._T._Z._Z",
            indicator_key="short_term_rate",
            unit="%",
            category="macro_pulse"
        )
    
    def fetch_oecd_long_term_rate(self) -> List[Dict[str, Any]]:
        """Fetch latest long-term interest rate data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.STES,DSD_KEI@DF_KEI,4.0",
            query="{countries}.M.IRLT.PA._Z._Z._Z",
            indicator_key="long_term_rate",
            unit="%",
            category="macro_pulse"
        )
    
    def fetch_oecd_unemployment(self) -> List[Dict[str, Any]]:
        """Fetch latest unemployment rate data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.TPS,DSD_LFS@DF_IALFS_UNE_M,1.0",
            query="{countries}.UNE_LF_M.._Z.Y._T.Y_GE15..M",
            indicator_key="unemployment",
            unit="%",
            category="macro_pulse"
        )
    
    def fetch_oecd_consumer_confidence(self) -> List[Dict[str, Any]]:
        """Fetch latest consumer confidence data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.STES,DSD_KEI@DF_KEI,4.0",
            query="{countries}.M.CCICP.IX._T.Y.",
            indicator_key="consumer_confidence",
            unit="index",
            category="macro_pulse"
        )
    
    def fetch_oecd_wage_growth(self) -> List[Dict[str, Any]]:
        """Fetch latest wage growth data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.ECO.MAD,DSD_EO@DF_EO,1.3",
            query="{countries}.WAGE.A",
            indicator_key="wage_growth",
            unit="%",
            category="macro_pulse"
        )
    
    def fetch_oecd_rent_index(self) -> List[Dict[str, Any]]:
        """Fetch latest rent index data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0",
            query="{countries}.M.N.CPI.PA.CP041..GY+_Z",
            indicator_key="rent_index",
            unit="%",
            category="operating_pressure"
        )
    
    def fetch_oecd_energy_utilities(self) -> List[Dict[str, Any]]:
        """Fetch latest energy & utilities price index data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0",
            query="{countries}.M.N.CPI.PA.CP045..GY",
            indicator_key="energy_utilities",
            unit="%",
            category="operating_pressure"
        )
    
    def fetch_oecd_tax_burden(self) -> List[Dict[str, Any]]:
        """Fetch latest tax burden data"""
        return self._fetch_latest_oecd_data(
            endpoint="OECD.SDD.NAD,DSD_NAAG_VI@DF_NAAG_EXP,1.0",
            query="A.{countries}.ODAS13_D2_D5_D91_D611_D613..PT_B1GQ.",
            indicator_key="tax_burden",
            unit="%",
            category="operating_pressure"
        )
    
    # Helper functions
    
    def get_cached_data(self) -> Dict[str, Any]:
        """
        Retrieve all cached benchmark data
        
        Returns:
            Dictionary with all cached benchmark data organized by categories
        """
        indicators = [
            'inflation', 'short_term_rate', 'long_term_rate', 
            'unemployment', 'consumer_confidence', 'wage_growth',
            'rent_index', 'energy_utilities', 'tax_burden'
        ]
        
        macro_pulse = {}
        operating_pressure = {}
        last_updates = {}
        
        for indicator in indicators:
            # Get data
            cache_key = f"benchmark:{indicator}"
            raw_data = cache.get(cache_key)
            data = json.loads(raw_data) if raw_data else []
            
            # Get last update
            timestamp_key = f"benchmark:{indicator}:last_update"
            last_update = cache.get(timestamp_key)
            last_updates[indicator] = last_update
            
            # Categorize
            if data and data[0].get('category') == 'macro_pulse':
                macro_pulse[indicator] = data
            elif data and data[0].get('category') == 'operating_pressure':
                operating_pressure[indicator] = data
        
        return {
            'macro_pulse': macro_pulse,
            'operating_pressure': operating_pressure,
            'last_updates': last_updates,
            'supported_countries': [
                {'code': code, 'name': self._get_country_name(code)}
                for code in self.countries
            ]
        }
    
    def _get_country_name(self, code: str) -> str:
        """Get country name from code"""
        country_names = {
            'USA': 'United States',
            'GBR': 'United Kingdom', 
            'DEU': 'Germany',
            'FRA': 'France'
        }
        return country_names.get(code, code)