#!/usr/bin/env python3
"""
Debug script to test OECD inflation data fetching
"""
import os
import sys
import django
import logging

# Add project path
sys.path.append('/home/maxim/Рабочий стол/mariami-fin-control/app/project')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import after Django setup
from benchmark.services.oecd_functions import fetch_oecd_inflation
from django.conf import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug_inflation_fetch():
    """Debug the inflation data fetch process"""
    print("=== OECD Inflation Data Debug ===")
    
    print(f"OECD_COUNTRIES_STRING: {settings.OECD_COUNTRIES_STRING}")
    print(f"OECD_MAIN_COUNTRIES: {settings.OECD_MAIN_COUNTRIES}")
    
    try:
        print("\nFetching inflation data...")
        result = fetch_oecd_inflation()
        
        if result:
            print(f"✅ Success! Got {len(result)} records")
            for record in result:
                print(f"  - {record['country']}: {record['value']}{record['unit']} ({record['period']})")
        else:
            print("❌ Failed - No data returned")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_inflation_fetch()