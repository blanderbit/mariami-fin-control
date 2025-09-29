"""
Currency settings and custom currency definitions using moneyed library
"""
import moneyed
from djmoney.settings import CURRENCY_CHOICES


# Define custom currencies using moneyed
# Add all supported currencies to ensure they're available
USD = moneyed.add_currency(
    code='USD',
    numeric='840',
    name='US Dollar',
    countries=('UNITED STATES',)
)

EUR = moneyed.add_currency(
    code='EUR',
    numeric='978',
    name='Euro',
    countries=('EUROPEAN UNION',)
)

GBP = moneyed.add_currency(
    code='GBP',
    numeric='826',
    name='British Pound',
    countries=('UNITED KINGDOM',)
)

CAD = moneyed.add_currency(
    code='CAD',
    numeric='124',
    name='Canadian Dollar',
    countries=('CANADA',)
)

AUD = moneyed.add_currency(
    code='AUD',
    numeric='036',
    name='Australian Dollar',
    countries=('AUSTRALIA',)
)

JPY = moneyed.add_currency(
    code='JPY',
    numeric='392',
    name='Japanese Yen',
    countries=('JAPAN',)
)

CHF = moneyed.add_currency(
    code='CHF',
    numeric='756',
    name='Swiss Franc',
    countries=('SWITZERLAND',)
)

SEK = moneyed.add_currency(
    code='SEK',
    numeric='752',
    name='Swedish Krona',
    countries=('SWEDEN',)
)

NOK = moneyed.add_currency(
    code='NOK',
    numeric='578',
    name='Norwegian Krone',
    countries=('NORWAY',)
)

DKK = moneyed.add_currency(
    code='DKK',
    numeric='208',
    name='Danish Krone',
    countries=('DENMARK',)
)


# Supported business currencies for the application
SUPPORTED_CURRENCIES = [
    ('USD', 'US Dollar'),
    ('EUR', 'Euro'),
    ('GBP', 'British Pound'),
    ('CAD', 'Canadian Dollar'),
    ('AUD', 'Australian Dollar'),
    ('JPY', 'Japanese Yen'),
    ('CHF', 'Swiss Franc'),
    ('SEK', 'Swedish Krona'),
    ('NOK', 'Norwegian Krone'),
    ('DKK', 'Danish Krone'),
]


# Currency symbols mapping
CURRENCY_SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
}


def get_currency_symbol(currency_code: str) -> str:
    """
    Get currency symbol for the given currency code
    
    Args:
        currency_code: 3-letter currency code
        
    Returns:
        Currency symbol string
    """
    return CURRENCY_SYMBOLS.get(currency_code, currency_code)


def get_currencies_list():
    """
    Get list of supported currencies with symbols
    
    Returns:
        List of dicts with currency info
    """
    return [
        {
            "code": code,
            "name": name,
            "symbol": get_currency_symbol(code)
        }
        for code, name in SUPPORTED_CURRENCIES
    ]


# Default currency for money fields
DEFAULT_CURRENCY = 'USD'