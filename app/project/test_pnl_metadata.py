#!/usr/bin/env python
"""
Test script to verify PnL metadata integration
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


def test_metadata_integration():
    """Test that PnL analysis service uses metadata correctly"""
    print("Testing PnL metadata integration...")
    
    from django.contrib.auth import get_user_model
    from users.services.financial_analysis_service import UserPNLAnalysisService
    from users.models.user_data_file import UserDataFile
    
    User = get_user_model()
    
    # Find a user with PnL data
    user_file = UserDataFile.objects.filter(
        template_type="pnl_template", 
        is_active=True
    ).first()
    
    if not user_file:
        print("❌ No PnL files found in database")
        return
    
    user = user_file.user
    print(f"📊 Testing with user: {user.email}")
    
    # Create service instance
    service = UserPNLAnalysisService(user)
    
    # Test metadata retrieval
    print("\n🔍 Testing metadata retrieval:")
    metadata = service._get_pnl_file_metadata()
    
    if metadata:
        print(f"✅ Metadata found: {metadata}")
        
        # Test column extraction
        expense_columns = service._get_expense_columns()
        revenue_columns = service._get_revenue_columns()
        date_column = service._get_date_column()
        
        print(f"💰 Expense columns: {expense_columns}")
        print(f"📈 Revenue columns: {revenue_columns}")
        print(f"📅 Date column: {date_column}")
        
        # Check if using metadata or defaults
        if 'expense_columns' in metadata:
            print("✅ Using expense columns from metadata")
        else:
            print("⚠️  Using default expense columns")
            
        if 'revenue_columns' in metadata:
            print("✅ Using revenue columns from metadata")
        else:
            print("⚠️  Using default revenue columns")
            
        if 'date_column' in metadata:
            print("✅ Using date column from metadata")
        else:
            print("⚠️  Using default date column")
    else:
        print("❌ No metadata found - using default columns")
        
        # Test fallback columns
        expense_columns = service._get_expense_columns()
        revenue_columns = service._get_revenue_columns()
        date_column = service._get_date_column()
        
        print(f"📊 Default expense columns: {expense_columns}")
        print(f"📈 Default revenue columns: {revenue_columns}")
        print(f"📅 Default date column: {date_column}")


def test_file_metadata_structure():
    """Test the structure of existing file metadata"""
    print("\n🔬 Testing file metadata structure...")
    
    from users.models.user_data_file import UserDataFile
    
    # Get all PnL files with metadata
    files_with_metadata = UserDataFile.objects.filter(
        template_type="pnl_template",
        meta_data__isnull=False
    )
    
    print(f"📁 Found {files_with_metadata.count()} PnL files with metadata")
    
    for file_obj in files_with_metadata[:3]:  # Show first 3
        print(f"\n📄 File: {file_obj.original_filename}")
        print(f"   User: {file_obj.user.email}")
        print(f"   Metadata: {file_obj.meta_data}")


if __name__ == "__main__":
    test_metadata_integration()
    test_file_metadata_structure()