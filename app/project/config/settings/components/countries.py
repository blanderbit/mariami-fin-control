# Countries configuration for OECD API integration

# Supported countries for our platform
SUPPORTED_COUNTRIES = [
    {'code': 'US', 'name': 'United States', 'oecd_code': 'USA'},
    {'code': 'GB', 'name': 'United Kingdom', 'oecd_code': 'GBR'},
    {'code': 'CA', 'name': 'Canada', 'oecd_code': 'CAN'},
    {'code': 'AU', 'name': 'Australia', 'oecd_code': 'AUS'},
    {'code': 'DE', 'name': 'Germany', 'oecd_code': 'DEU'},
    {'code': 'FR', 'name': 'France', 'oecd_code': 'FRA'},
    {'code': 'IT', 'name': 'Italy', 'oecd_code': 'ITA'},
    {'code': 'ES', 'name': 'Spain', 'oecd_code': 'ESP'},
    {'code': 'NL', 'name': 'Netherlands', 'oecd_code': 'NLD'},
    {'code': 'SE', 'name': 'Sweden', 'oecd_code': 'SWE'},
    {'code': 'NO', 'name': 'Norway', 'oecd_code': 'NOR'},
    {'code': 'DK', 'name': 'Denmark', 'oecd_code': 'DNK'},
    {'code': 'CH', 'name': 'Switzerland', 'oecd_code': 'CHE'},
]

# Get OECD country codes for API queries
OECD_COUNTRY_CODES = [country['oecd_code'] for country in SUPPORTED_COUNTRIES]

# Create a string of main countries for OECD API queries
OECD_COUNTRIES_STRING = '+'.join(OECD_COUNTRY_CODES)

# Create a dictionary for quick country lookups
SUPPORTED_COUNTRIES_DICT = {
    country['code']: country for country in SUPPORTED_COUNTRIES
}