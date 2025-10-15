#!/usr/bin/env python
"""
Test script to verify the new OECD data fetching logic
"""
import os
import sys
import django
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from benchmark.services.oecd_functions import fetch_oecd_inflation
from django.core.cache import cache

def test_inflation_data():
    print("Testing inflation data fetch...")
    
    # Clear cache for this indicator
    cache.delete("benchmark:inflation")
    cache.delete("benchmark:inflation:last_update")
    print("Cleared cache for inflation")
    
    # Fetch fresh data
    try:
        data = fetch_oecd_inflation()
        
        if not data:
            print("❌ No data returned")
            return
            
        print(f"✅ Fetched {len(data)} records")
        
        # Check for duplicates by country
        countries = [record['country'] for record in data]
        unique_countries = set(countries)
        
        if len(countries) == len(unique_countries):
            print("✅ No duplicate countries")
        else:
            print(f"❌ Found duplicates! Countries: {countries}")
            print(f"   Unique countries: {list(unique_countries)}")
        
        # Check periods
        periods = [record['period'] for record in data]
        unique_periods = set(periods)
        
        print(f"📅 Periods found: {sorted(unique_periods)}")
        
        if len(unique_periods) == 1:
            print("✅ All records from same period")
        else:
            print(f"⚠️  Multiple periods found: {sorted(unique_periods)}")
        
        # Show sample records
        print("\n📊 Sample records:")
        for i, record in enumerate(data[:3]):
            print(f"   {i+1}. {record['country']}: {record['value']}% ({record['period']})")
            
        # Show all records
        print(f"\n📋 All {len(data)} records:")
        for record in sorted(data, key=lambda x: x['country']):
            print(f"   {record['country']}: {record['value']}% ({record['period']})")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_inflation_data()