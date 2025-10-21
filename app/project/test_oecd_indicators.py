#!/usr/bin/env python3
"""
Test script for OECD indicators that were having issues
"""

import os
import sys
import django

# Setup Django
sys.path.append('/home/maxim/Рабочий стол/mariami-fin-control/app/project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import after Django setup
from benchmark.services.oecd_functions import (  # noqa: E402
    fetch_oecd_consumer_confidence,
    fetch_oecd_short_term_rate
)


def test_consumer_confidence():
    """Test consumer confidence fetching"""
    print("🧪 Testing consumer confidence...")
    
    try:
        data = fetch_oecd_consumer_confidence()
        print(f"✅ Consumer confidence: {len(data)} records returned")
        
        if data:
            print(f"Sample record: {data[0]}")
            periods = [r['period'] for r in data]
            countries = [r['country'] for r in data]
            print(f"Periods: {sorted(set(periods))}")
            print(f"Countries: {sorted(set(countries))}")
        else:
            print("❌ No data returned for consumer confidence")
            
    except Exception as e:
        print(f"❌ Error testing consumer confidence: {e}")


def test_short_term_rate():
    """Test short-term rate fetching"""
    print("\n🧪 Testing short-term rate...")
    
    try:
        data = fetch_oecd_short_term_rate()
        print(f"✅ Short-term rate: {len(data)} records returned")
        
        if data:
            print(f"Sample record: {data[0]}")
            periods = [r['period'] for r in data]
            countries = [r['country'] for r in data]
            print(f"Periods: {sorted(set(periods))}")
            print(f"Countries: {sorted(set(countries))}")
        else:
            print("❌ No data returned for short-term rate")
            
    except Exception as e:
        print(f"❌ Error testing short-term rate: {e}")


if __name__ == "__main__":
    test_consumer_confidence()
    test_short_term_rate()
    print("\n🎉 Testing completed!")