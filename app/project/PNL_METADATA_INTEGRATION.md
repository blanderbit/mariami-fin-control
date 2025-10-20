# PnL Analysis Service - Metadata Integration

## Overview

The `UserPNLAnalysisService` has been updated to use dynamic column configuration from file metadata instead of hardcoded column names.

## Changes Made

### 1. New Metadata Methods

```python
def _get_pnl_file_metadata(self) -> Optional[Dict]
def _get_expense_columns(self) -> List[str]
def _get_revenue_columns(self) -> List[str]  
def _get_date_column(self) -> str
```

### 2. Updated Analysis Methods

All analysis methods now use dynamic columns from metadata:

- `_filter_pnl_data()` - Uses dynamic date column
- `_calculate_total_revenue()` - Uses dynamic revenue columns
- `_calculate_total_expenses()` - Uses dynamic expense columns
- `_calculate_expenses_by_categories()` - Uses dynamic expense columns
- `_analyze_expense_categories()` - Uses dynamic expense columns
- `_calculate_gross_margin()` - Intelligently finds COGS columns

### 3. Fallback Strategy

If no metadata is found, the service falls back to default columns:

```python
# Default columns
date_column = "Month"
revenue_columns = ["Revenue"]
expense_columns = ["COGS", "Payroll", "Rent", "Marketing", "Other_Expenses"]
```

## Metadata Structure

The service expects metadata in this format:

```json
{
    "date_column": "Month",
    "expense_columns": ["COGS", "Payroll", "Rent", "Marketing", "Other_Expenses"],
    "revenue_columns": ["Revenue", "Other_Income"]
}
```

## Benefits

1. **Flexibility**: Users can upload PnL files with custom column names
2. **Backward Compatibility**: Existing files without metadata still work
3. **User Experience**: Upload process can save column mappings for reuse
4. **Accuracy**: Analysis uses actual column names from user's files

## Usage Example

```python
# The service automatically uses metadata
service = UserPNLAnalysisService(user)

# These methods now use dynamic columns from metadata
analysis = service.get_pnl_analysis(start_date, end_date)
breakdown = service.get_expense_breakdown(start_date, end_date)
```

## Testing

Use `test_pnl_metadata.py` to verify:
- Metadata retrieval works correctly
- Column extraction uses metadata when available
- Fallback to defaults when metadata is missing
- File metadata structure is correct