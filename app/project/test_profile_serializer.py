#!/usr/bin/env python
"""
Test script to verify oecd_country field in ProfileSerializer
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

def test_profile_serializer():
    print("Testing ProfileSerializer with oecd_country field...")
    
    from profile.models import ProfileModel
    from profile.serializers.get_my_profile_serializer import ProfileSerializer
    from django.conf import settings
    
    # Test settings
    print(f"📋 SUPPORTED_COUNTRIES_DICT exists: {hasattr(settings, 'SUPPORTED_COUNTRIES_DICT')}")
    if hasattr(settings, 'SUPPORTED_COUNTRIES_DICT'):
        print(f"   Contains {len(settings.SUPPORTED_COUNTRIES_DICT)} countries")
        print("   Sample entries:")
        for i, (code, country_data) in enumerate(list(settings.SUPPORTED_COUNTRIES_DICT.items())[:3]):
            print(f"     {code} -> {country_data}")
    
    # Create a test profile
    profile = ProfileModel(
        name="Test User",
        country="US",  # Should map to USA in OECD
        currency="USD",
        industry="Technology"
    )
    
    # Test the property directly
    print(f"\n🏷️  Profile country: {profile.country}")
    print(f"🌐 OECD country (property): {profile.oecd_country}")
    
    # Test the serializer
    serializer = ProfileSerializer(profile)
    serialized_data = serializer.data
    
    print(f"\n📊 Serializer fields:")
    for field, value in serialized_data.items():
        if field == 'oecd_country':
            print(f"   ✅ {field}: {value}")
        elif field in ['name', 'country', 'currency', 'industry']:
            print(f"   📝 {field}: {value}")
    
    # Check if oecd_country is in the serialized data
    if 'oecd_country' in serialized_data:
        print(f"\n✅ SUCCESS: oecd_country field is included in serializer")
        print(f"   Value: {serialized_data['oecd_country']}")
    else:
        print(f"\n❌ FAILED: oecd_country field is NOT included in serializer")
        print(f"   Available fields: {list(serialized_data.keys())}")

if __name__ == "__main__":
    test_profile_serializer()