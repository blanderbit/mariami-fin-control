"""
OECD Data Service - Refactored as standalone functions
"""

import json
import logging
import requests
import pandas as pd
from typing import Dict, List, Any, Optional
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

# Configuration constants
BASE_URL = "https://sdmx.oecd.org/public/rest/data"
CACHE_TIMEOUT = 86400  # 24 hours


def _is_better_value(indicator_key: str, new_value: float, existing_value: float) -> bool:
    """
    Determine which value is better for a given indicator
    
    For inflation-type indicators, prefer values that look like growth rates
    over values that look like indices
    """
    # For price-related indicators, prefer smaller absolute values
    # (growth rates are typically smaller than price indices)
    if indicator_key in ['inflation', 'rent_index', 'energy_utilities']:
        return abs(new_value) < abs(existing_value)
    
    # For other indicators, keep existing value (first one wins)
    return False


def fetch_latest_oecd_data(
    endpoint: str, query: str, indicator_key: str, unit: str, category: str
) -> List[Dict[str, Any]]:
    """
    Common function to fetch latest OECD data for any indicator with caching

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
        # Check cache first
        cache_key = f"benchmark:{indicator_key}"
        cached_data = cache.get(cache_key)

        if cached_data:
            logger.info(f"Returning cached data for {indicator_key}")
            return json.loads(cached_data)

        # Format query with countries
        logger.info(f"OECD_COUNTRIES_STRING: {settings.OECD_COUNTRIES_STRING}")
        formatted_query = query.format(countries=settings.OECD_COUNTRIES_STRING)
        logger.info(f"Formatted query: {formatted_query}")

        # Build URL to get only latest observation in JSON format
        url = (
            f"{BASE_URL}/{endpoint}/{formatted_query}"
            f"?lastNObservations=1&format=jsondata"
        )

        logger.info(f"Fetching {indicator_key} from: {url}")

        # Make request with timeout and JSON headers
        headers = {"Accept": "application/json", "User-Agent": "MariaMi-FinControl/1.0"}
        response = requests.get(url, timeout=30, headers=headers)
        response.raise_for_status()

        # Check content type
        content_type = response.headers.get("content-type", "")
        if "json" not in content_type.lower():
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
        if "data" not in data:
            logger.error(f"No 'data' key in response for {indicator_key}")
            return []

        if (
            "structures" not in data["data"]
            or "dataSets" not in data["data"]
            or not data["data"]["dataSets"]
            or not data["data"]["structures"]
        ):
            logger.warning(f"Invalid data structure for {indicator_key}")
            return []

        # Extract time dimensions from the correct location
        structure = data["data"]["structures"][0]["dimensions"]
        obs_time = [v["id"] for v in structure["observation"][0]["values"]]

        # Process dataset
        datasets = data["data"]["dataSets"][0]
        if "series" not in datasets:
            logger.warning(f"No series data for {indicator_key}")
            return []

        records = []

        # Create country mapping from structure dimensions
        country_dimension = None
        for dim in structure["series"]:
            if dim["id"] == "REF_AREA":
                country_dimension = dim
                break

        if not country_dimension:
            logger.warning(f"No REF_AREA dimension found for {indicator_key}")
            return []

        country_mapping = {
            str(idx): country["id"]
            for idx, country in enumerate(country_dimension["values"])
        }

        # Process each country's data
        # Use dictionary to store only the best record per country
        country_records = {}
        
        for series_key, series_val in datasets["series"].items():
            # Parse series key (format like "3:0:0")
            key_parts = series_key.split(":")
            if len(key_parts) < 1:
                continue

            country_idx = key_parts[0]
            country_code = country_mapping.get(country_idx)

            if not country_code:
                logger.debug(
                    f"Unknown country index {country_idx} in series {series_key}"
                )
                continue

            if "observations" in series_val and series_val["observations"]:
                # Get the latest observation (should be only one)
                latest_obs_key = max(series_val["observations"].keys())
                latest_obs_val = series_val["observations"][latest_obs_key]

                if (
                    latest_obs_val
                    and len(latest_obs_val) > 0
                    and latest_obs_val[0] is not None
                ):
                    value = float(latest_obs_val[0])
                    
                    record = {
                        "country": country_code,
                        "period": obs_time[int(latest_obs_key)],
                        "value": value,
                        "indicator": indicator_key,
                        "unit": unit,
                        "category": category,
                        "series_key": series_key,  # Keep track of which series this is from
                    }
                    
                    # Only keep one record per country
                    if country_code not in country_records:
                        country_records[country_code] = record
                    else:
                        existing_record = country_records[country_code]
                        # Compare periods and keep the most recent one
                        if record["period"] > existing_record["period"]:
                            country_records[country_code] = record
                        elif record["period"] == existing_record["period"]:
                            # For same period, prefer the better value based on indicator type
                            # For inflation-type indicators, prefer smaller absolute values
                            if _is_better_value(indicator_key, record["value"], existing_record["value"]):
                                country_records[country_code] = record

        # Find the most recent period across all countries
        if country_records:
            most_recent_period = max(record["period"] for record in country_records.values())
            
            # Filter to only keep records from the most recent period
            # If a country doesn't have data for the most recent period, we'll keep their latest available
            final_country_records = {}
            for country_code, record in country_records.items():
                final_country_records[country_code] = record
            
            logger.info(f"Most recent period found: {most_recent_period}")
            
            # Convert to list and remove series_key from final records
            records = []
            for record in final_country_records.values():
                final_record = record.copy()
                final_record.pop("series_key", None)  # Remove helper field
                records.append(final_record)
        else:
            records = []

        logger.info(f"Successfully fetched {len(records)} records for {indicator_key}")
        
        if records:
            periods = [r["period"] for r in records]
            logger.info(f"Periods in result: {sorted(set(periods))}")
            logger.info(f"Sample record: {records[0]}")
        else:
            logger.warning(f"No records found for {indicator_key}")

        # Cache the data
        _cache_indicator_data(indicator_key, records)

        return records

    except requests.RequestException as e:
        logger.error(f"Network error fetching {indicator_key}: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Error fetching {indicator_key}: {str(e)}")
        return []


def _cache_indicator_data(indicator_key: str, data: List[Dict[str, Any]]) -> None:
    """
    Cache indicator data in Redis

    Args:
        indicator_key: Unique identifier for the indicator
        data: List of data records to cache
    """
    try:
        cache_key = f"benchmark:{indicator_key}"
        cache.set(cache_key, json.dumps(data), timeout=CACHE_TIMEOUT)

        # Update last update timestamp for this indicator
        timestamp_key = f"benchmark:{indicator_key}:last_update"
        cache.set(timestamp_key, pd.Timestamp.now().isoformat(), timeout=CACHE_TIMEOUT)

        logger.info(f"Cached {len(data)} records for {indicator_key}")

    except Exception as e:
        logger.error(f"Error caching {indicator_key}: {str(e)}")


def get_cached_indicator_data(indicator_key: str) -> Optional[List[Dict[str, Any]]]:
    """
    Get cached data for a specific indicator

    Args:
        indicator_key: Unique identifier for the indicator

    Returns:
        List of data records or None if not cached
    """
    try:
        cache_key = f"benchmark:{indicator_key}"
        raw_data = cache.get(cache_key)
        return json.loads(raw_data) if raw_data else None
    except Exception as e:
        logger.error(f"Error retrieving cached data for {indicator_key}: {str(e)}")
        return None


def get_indicator_last_update(indicator_key: str) -> Optional[str]:
    """
    Get last update timestamp for an indicator

    Args:
        indicator_key: Unique identifier for the indicator

    Returns:
        ISO timestamp string or None if not found
    """
    try:
        timestamp_key = f"benchmark:{indicator_key}:last_update"
        return cache.get(timestamp_key)
    except Exception as e:
        logger.error(f"Error retrieving last update for {indicator_key}: {str(e)}")
        return None


# Individual indicator fetch functions


def fetch_oecd_inflation() -> List[Dict[str, Any]]:
    """Fetch latest inflation (CPI) data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0",
        query="{countries}.M.N.CPI.._T..GY+_Z",
        indicator_key="inflation",
        unit="%",
        category="macro_pulse"
    )


def fetch_oecd_short_term_rate() -> List[Dict[str, Any]]:
    """Fetch latest short-term interest rate data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.STES,DSD_KEI@DF_KEI,4.0",
        query="{countries}.M.IR3TIB.PA._T._Z._Z",
        indicator_key="short_term_rate",
        unit="%",
        category="macro_pulse"
    )


def fetch_oecd_long_term_rate() -> List[Dict[str, Any]]:
    """Fetch latest long-term interest rate data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.STES,DSD_KEI@DF_KEI,4.0",
        query="{countries}.M.IRLT.PA._Z._Z._Z",
        indicator_key="long_term_rate",
        unit="%",
        category="macro_pulse"
    )


def fetch_oecd_consumer_confidence() -> List[Dict[str, Any]]:
    """Fetch latest consumer confidence data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.STES,DSD_KEI@DF_KEI,4.0",
        query="{countries}.M.CCICP.IX._T.Y.",
        indicator_key="consumer_confidence",
        unit="index",
        category="macro_pulse"
    )


def fetch_oecd_wage_growth() -> List[Dict[str, Any]]:
    """Fetch latest wage growth data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.ECO.MAD,DSD_EO@DF_EO,1.3",
        query="{countries}.WAGE.A..GY+_Z",
        indicator_key="wage_growth",
        unit="%",
        category="macro_pulse"
    )


def fetch_oecd_rent_index() -> List[Dict[str, Any]]:
    """Fetch latest rent index data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0",
        query="{countries}.M.N.CPI.PA.CP041..GY+_Z",
        indicator_key="rent_index",
        unit="%",
        category="operating_pressure"
    )


def fetch_oecd_energy_utilities() -> List[Dict[str, Any]]:
    """Fetch latest energy & utilities price index data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.TPS,DSD_PRICES@DF_PRICES_ALL,1.0",
        query="{countries}.M.N.CPI.PA.CP045..GY",
        indicator_key="energy_utilities",
        unit="%",
        category="operating_pressure"
    )


def fetch_oecd_tax_burden() -> List[Dict[str, Any]]:
    """Fetch latest tax burden data"""
    return fetch_latest_oecd_data(
        endpoint="OECD.SDD.NAD,DSD_NAAG_VI@DF_NAAG_EXP,1.0",
        query="A.{countries}.ODAS13_D2_D5_D91_D611_D613..PT_B1GQ.",
        indicator_key="tax_burden",
        unit="%",
        category="operating_pressure"
    )
