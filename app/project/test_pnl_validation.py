#!/usr/bin/env python3
"""
Simple test script to verify PnL file validation with metadata
"""

import os
import sys
import django
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django
sys.path.append('/home/maxim/Рабочий стол/mariami-fin-control/app/project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import after Django setup
from config.utils.file_validators import FileFormatValidator  # noqa: E402


def create_test_csv(content: str, filename: str) -> SimpleUploadedFile:
    """Create a test CSV file"""
    return SimpleUploadedFile(
        filename,
        content.encode('utf-8'),
        content_type='text/csv'
    )


def test_pnl_validation_with_metadata():
    """Test PnL validation with metadata"""
    print("🧪 Testing PnL validation with metadata...")
    
    # Test case 1: Valid file with all columns present
    csv_content_valid = """Month,Revenue,COGS,Payroll,Other_Expense
2023-01,10000,3000,2000,1000
2023-02,12000,3500,2000,1200
2023-03,11000,3200,2000,1100"""
    
    file_valid = create_test_csv(csv_content_valid, "test_valid.csv")
    
    metadata_valid = {
        'date_column': 'Month',
        'expense_columns': ['COGS', 'Payroll'],
        'revenue_columns': ['Revenue']
    }
    
    is_valid, message = FileFormatValidator.validate_pnl_with_metadata(
        file_valid, metadata_valid
    )
    
    print(f"✅ Test 1 - Valid file: {is_valid}, Message: {message}")
    assert is_valid, f"Expected valid, got: {message}"
    
    # Test case 2: Invalid file - missing expense column
    metadata_invalid = {
        'date_column': 'Month',
        'expense_columns': ['COGS', 'Marketing'],  # Marketing doesn't exist
        'revenue_columns': ['Revenue']
    }
    
    file_invalid = create_test_csv(csv_content_valid, "test_invalid.csv")
    
    is_valid, message = FileFormatValidator.validate_pnl_with_metadata(
        file_invalid, metadata_invalid
    )
    
    print(f"❌ Test 2 - Invalid file: {is_valid}, Message: {message}")
    assert not is_valid, "Expected invalid file"
    assert "Marketing" in message, (
        f"Expected 'Marketing' in error message: {message}"
    )
    
    # Test case 3: Invalid file - missing date column
    metadata_no_date = {
        'date_column': 'Date',  # Date doesn't exist, only Month
        'expense_columns': ['COGS'],
        'revenue_columns': ['Revenue']
    }
    
    file_no_date = create_test_csv(csv_content_valid, "test_no_date.csv")
    
    is_valid, message = FileFormatValidator.validate_pnl_with_metadata(
        file_no_date, metadata_no_date
    )
    
    print(f"❌ Test 3 - Missing date column: {is_valid}, Message: {message}")
    assert not is_valid, "Expected invalid file"
    assert "Date" in message, f"Expected 'Date' in error message: {message}"
    
    print("🎉 All tests passed!")


if __name__ == "__main__":
    test_pnl_validation_with_metadata()