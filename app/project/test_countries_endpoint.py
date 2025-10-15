#!/usr/bin/env python
"""
Test script to verify the new countries endpoint
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

def test_countries_endpoint():
    print("Testing countries endpoint...")
    
    # Test the view directly
    from benchmark.views.individual_views import SupportedCountriesView
    from rest_framework.test import APIRequestFactory
    from django.contrib.auth.models import User
    
    # Create a test request
    factory = APIRequestFactory()
    request = factory.get('/api/v1/benchmark/countries/')
    
    # Create a test user (since endpoint requires authentication)
    user = User.objects.create_user('testuser', 'test@example.com', 'testpass')
    request.user = user
    
    # Create view instance and call get method
    view = SupportedCountriesView()
    response = view.get(request)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Data: {response.data}")
    
    if response.status_code == 200:
        print("✅ Countries endpoint working successfully")
        data = response.data.get('data', [])
        print(f"📊 Found {len(data)} supported countries:")
        for country in data:
            print(f"   - {country['name']} ({country['code']}) -> OECD: {country['oecd_code']}")
    else:
        print("❌ Countries endpoint failed")
    
    # Test settings access directly
    from django.conf import settings
    print(f"\n📋 Settings test:")
    countries_from_settings = getattr(settings, 'SUPPORTED_COUNTRIES', [])
    print(f"   Found {len(countries_from_settings)} countries in settings")

if __name__ == "__main__":
    test_countries_endpoint()