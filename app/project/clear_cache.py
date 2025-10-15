#!/usr/bin/env python
"""
Clear cache and test inflation data fetching
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

from django.core.cache import cache

def clear_benchmark_cache():
    """Clear all benchmark-related cache keys"""
    indicators = [
        'inflation', 'short_term_rate', 'long_term_rate', 
        'consumer_confidence', 'wage_growth',
        'rent_index', 'energy_utilities', 'tax_burden'
    ]
    
    cleared_keys = []
    for indicator in indicators:
        data_key = f"benchmark:{indicator}"
        timestamp_key = f"benchmark:{indicator}:last_update"
        
        if cache.get(data_key):
            cache.delete(data_key)
            cleared_keys.append(data_key)
            
        if cache.get(timestamp_key):
            cache.delete(timestamp_key)
            cleared_keys.append(timestamp_key)
    
    print(f"✅ Cleared {len(cleared_keys)} cache keys:")
    for key in cleared_keys:
        print(f"   - {key}")
    
    if not cleared_keys:
        print("ℹ️  No cache keys found to clear")

if __name__ == "__main__":
    clear_benchmark_cache()