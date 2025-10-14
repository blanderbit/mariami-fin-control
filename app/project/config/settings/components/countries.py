# Countries configuration for OECD API integration

# Mapping of our country codes to OECD country codes
COUNTRY_CODE_MAPPING = {
    'US': 'USA',   # United States
    'GB': 'GBR',   # United Kingdom  
    'CA': 'CAN',   # Canada
    'AU': 'AUS',   # Australia
    'DE': 'DEU',   # Germany
    'FR': 'FRA',   # France
    'IT': 'ITA',   # Italy
    'ES': 'ESP',   # Spain
    'NL': 'NLD',   # Netherlands
    'SE': 'SWE',   # Sweden
    'NO': 'NOR',   # Norway
    'DK': 'DNK',   # Denmark
    'CH': 'CHE',   # Switzerland
    'JP': 'JPN',   # Japan
    'SG': 'SGP',   # Singapore (Note: Not always available in OECD)
    'HK': 'HKG',   # Hong Kong (Note: Not always available in OECD)
}

# Supported countries for our platform
SUPPORTED_COUNTRIES = [
    {'code': 'US', 'name': 'United States', 'oecd_code': 'USA'},
    {'code': 'GB', 'name': 'United Kingdom', 'oecd_code': 'GBR'},
    {'code': 'CA', 'name': 'Canada', 'oecd_code': 'CAN'},
    {'code': 'AU', 'name': 'Australia', 'oecd_code': 'AUS'},
    # {'code': 'DE', 'name': 'Germany', 'oecd_code': 'DEU'},
    # {'code': 'FR', 'name': 'France', 'oecd_code': 'FRA'},
    # {'code': 'IT', 'name': 'Italy', 'oecd_code': 'ITA'},
    # {'code': 'ES', 'name': 'Spain', 'oecd_code': 'ESP'},
    # {'code': 'NL', 'name': 'Netherlands', 'oecd_code': 'NLD'},
    # {'code': 'SE', 'name': 'Sweden', 'oecd_code': 'SWE'},
    # {'code': 'NO', 'name': 'Norway', 'oecd_code': 'NOR'},
    # {'code': 'DK', 'name': 'Denmark', 'oecd_code': 'DNK'},
    # {'code': 'CH', 'name': 'Switzerland', 'oecd_code': 'CHE'},
    # {'code': 'JP', 'name': 'Japan', 'oecd_code': 'JPN'},
    # # Note: Singapore and Hong Kong may have limited OECD data availability
    # {'code': 'SG', 'name': 'Singapore', 'oecd_code': 'SGP'},
    # {'code': 'HK', 'name': 'Hong Kong', 'oecd_code': 'HKG'},
]

# Get OECD country codes for API queries
OECD_COUNTRY_CODES = [country['oecd_code'] for country in SUPPORTED_COUNTRIES]

# Countries with full OECD data availability (excluding SG and HK for main indicators)
OECD_MAIN_COUNTRIES = [country['oecd_code'] for country in SUPPORTED_COUNTRIES 
                       if country['code'] not in ['SG', 'HK']]

# Create a string of main countries for OECD API queries
OECD_COUNTRIES_STRING = '+'.join(OECD_MAIN_COUNTRIES)