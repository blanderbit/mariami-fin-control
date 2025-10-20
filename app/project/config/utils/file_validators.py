import io
import pandas as pd
from typing import Dict, List, Tuple, Union
from django.core.files.uploadedfile import UploadedFile


class FileFormatValidator:
    """Validator for uploaded CSV/Excel files"""
    
    # Expected columns for each template type
    TEMPLATE_SCHEMAS = {
        'pnl_template': [
            'Month', 'Revenue', 'COGS', 'Payroll', 'Rent', 
            'Marketing', 'Other_Expenses', 'Net_Profit'
        ],
        'transactions_template': [
            'Date', 'Type', 'Category', 'Amount', 
            'Client_Supplier', 'Memo'
        ],
        'invoices_template': [
            'Invoice_ID', 'Date_Issued', 'Date_Due', 'Amount', 
            'Status', 'Client', 'Date_Paid'
        ]
    }
    
    @classmethod
    def validate_file_format(cls, file: UploadedFile) -> Tuple[bool, str, Union[str, None]]:
        """
        Validate file format and detect template type
        Returns: (is_valid, error_message, template_type)
        """
        try:
            # Check file extension
            if not cls._is_valid_extension(file.name):
                return False, "Неподдерживаемый формат файла. Разрешены только CSV и Excel файлы.", None
            
            # Read file content
            df = cls._read_file_content(file)
            if df is None:
                return False, "Не удалось прочитать файл. Проверьте формат файла.", None
            
            # Detect template type
            template_type = cls._detect_template_type(df.columns.tolist())
            if not template_type:
                return False, "Неизвестный формат файла. Файл не соответствует ни одному из ожидаемых шаблонов.", None
            
            # Validate columns
            is_valid, error = cls._validate_columns(df.columns.tolist(), template_type)
            if not is_valid:
                return False, error, None
            
            return True, "Файл валиден", template_type
            
        except Exception as e:
            return False, f"Ошибка при валидации файла: {str(e)}", None
    
    @classmethod
    def validate_multiple_files(cls, files: List[UploadedFile]) -> Tuple[bool, str, Dict[str, str]]:
        """
        Validate multiple files
        Returns: (all_valid, error_message, file_template_mapping)
        """
        file_template_mapping = {}
        errors = []
        
        for file in files:
            is_valid, error, template_type = cls.validate_file_format(file)
            if not is_valid:
                errors.append(f"{file.name}: {error}")
            else:
                # Check for duplicate template types
                if template_type in file_template_mapping.values():
                    errors.append(f"{file.name}: Файл типа {template_type} уже был загружен")
                else:
                    file_template_mapping[file.name] = template_type
        
        if errors:
            return False, "; ".join(errors), {}
        
        return True, "Все файлы валидны", file_template_mapping
    
    @classmethod
    def validate_pnl_with_metadata(
        cls, file: UploadedFile, metadata: dict
    ) -> Tuple[bool, str]:
        """
        Validate PnL file with custom metadata columns
        Returns: (is_valid, error_message)
        """
        try:
            # Check file extension
            if not cls._is_valid_extension(file.name):
                return (
                    False,
                    "Неподдерживаемый формат файла. "
                    "Разрешены только CSV и Excel файлы."
                )
            
            # Read file content
            df = cls._read_file_content(file)
            if df is None:
                return (
                    False,
                    "Не удалось прочитать файл. Проверьте формат файла."
                )
            
            # Get actual columns from file
            actual_columns = set(df.columns.str.strip())  # Remove whitespace
            
            # Extract required columns from metadata
            required_columns = set()
            missing_columns = []
            
            # Check date column
            date_column = metadata.get('date_column')
            if date_column:
                required_columns.add(date_column.strip())
                if date_column.strip() not in actual_columns:
                    missing_columns.append(f"Колонка даты: '{date_column}'")
            
            # Check expense columns
            expense_columns = metadata.get('expense_columns', [])
            if expense_columns:
                for col in expense_columns:
                    col_stripped = col.strip()
                    required_columns.add(col_stripped)
                    if col_stripped not in actual_columns:
                        missing_columns.append(f"Колонка расходов: '{col}'")
            
            # Check revenue columns
            revenue_columns = metadata.get('revenue_columns', [])
            if revenue_columns:
                for col in revenue_columns:
                    col_stripped = col.strip()
                    required_columns.add(col_stripped)
                    if col_stripped not in actual_columns:
                        missing_columns.append(f"Колонка доходов: '{col}'")
            
            # Check if any required columns are missing
            if missing_columns:
                error_msg = (
                    f"Отсутствуют указанные колонки в файле: "
                    f"{', '.join(missing_columns)}"
                )
                return False, error_msg
            
            # Check if file has at least some data
            if df.empty:
                return False, "Файл не содержит данных"
            
            # Validate date column contains valid dates (if specified)
            if date_column and date_column.strip() in actual_columns:
                try:
                    pd.to_datetime(df[date_column.strip()], errors='coerce')
                except Exception:
                    return (
                        False,
                        f"Колонка '{date_column}' содержит недопустимые даты"
                    )
            
            return True, "PnL файл с метаданными валиден"
            
        except Exception as e:
            return False, f"Ошибка при валидации PnL файла: {str(e)}"
    
    @classmethod
    def _is_valid_extension(cls, filename: str) -> bool:
        """Check if file has valid extension"""
        valid_extensions = ['.csv', '.xlsx', '.xls']
        return any(filename.lower().endswith(ext) for ext in valid_extensions)
    
    @classmethod
    def _read_file_content(
        cls, file: UploadedFile
    ) -> Union[pd.DataFrame, None]:
        """Read file content into DataFrame"""
        try:
            file.seek(0)  # Reset file pointer
            content = file.read()
            
            if file.name.lower().endswith('.csv'):
                return pd.read_csv(io.StringIO(content.decode('utf-8')))
            elif file.name.lower().endswith(('.xlsx', '.xls')):
                return pd.read_excel(io.BytesIO(content))
            
        except Exception as e:
            print(f"Error reading file {file.name}: {e}")
            return None
    
    @classmethod
    def _detect_template_type(cls, columns: List[str]) -> Union[str, None]:
        """Detect template type based on columns"""
        for template_type, expected_columns in cls.TEMPLATE_SCHEMAS.items():
            if set(columns) == set(expected_columns):
                return template_type
        return None
    
    @classmethod
    def _validate_columns(
        cls, columns: List[str], template_type: str
    ) -> Tuple[bool, str]:
        """Validate that file has all required columns"""
        expected_columns = set(cls.TEMPLATE_SCHEMAS[template_type])
        actual_columns = set(columns)
        
        missing_columns = expected_columns - actual_columns
        extra_columns = actual_columns - expected_columns
        
        errors = []
        if missing_columns:
            errors.append(f"Отсутствуют колонки: {', '.join(missing_columns)}")
        if extra_columns:
            errors.append(f"Лишние колонки: {', '.join(extra_columns)}")
        
        if errors:
            return False, "; ".join(errors)
        
        return True, "Колонки валидны"
