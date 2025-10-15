#!/usr/bin/env python3
"""
Test script to debug OECD inflation data fetching
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.insert(0, '/home/maxim/Рабочий стол/mariami-fin-control/app')
os.chdir('/home/maxim/Рабочий стол/mariami-fin-control/app')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.config.settings')
django.setup()

from project.benchmark.services.oecd_functions import fetch_oecd_inflation
from django.conf import settings
import json


def test_inflation_data():
    """Test inflation data fetching"""
    print("=" * 60)
    print("TESTING INFLATION DATA FETCHING")
    print("=" * 60)
    
    print(f"OECD Countries: {settings.OECD_COUNTRIES_STRING}")
    print(f"Total countries: {len(settings.OECD_MAIN_COUNTRIES)}")
    print()
    
    try:
        # Fetch inflation data
        print("Fetching inflation data...")
        data = fetch_oecd_inflation()
        
        print(f"Total records returned: {len(data)}")
        print()
        
        if data:
            # Group by country to check for duplicates
            by_country = {}
            for record in data:
                country = record['country']
                if country not in by_country:
                    by_country[country] = []
                by_country[country].append(record)
            
            print("Records by country:")
            for country, records in by_country.items():
                print(f"  {country}: {len(records)} record(s)")
                for i, record in enumerate(records):
                    print(f"    Record {i+1}: Period={record['period']}, Value={record['value']:.2f}%")
            
            print()
            print("Sample records:")
            for i, record in enumerate(data[:5]):  # Show first 5 records
                print(f"  {i+1}. {record['country']}: {record['value']:.2f}% ({record['period']})")
                
        else:
            print("No data returned!")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_inflation_data()