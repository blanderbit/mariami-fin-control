from rest_framework import serializers

from config.utils.file_validators import FileFormatValidator
from users.models import UserDataFile
from users.constants.file_upload_errors import FILE_SIZE_EXCEEDED, NO_FILES_PROVIDED
from rest_framework.status import HTTP_400_BAD_REQUEST


class UserDataFileSerializer(serializers.ModelSerializer):
    """Serializer for user uploaded files information"""

    class Meta:
        model = UserDataFile
        fields = [
            "template_type",
            "original_filename",
            "stored_filename",
            "file_path",
            "file_size",
            "upload_time",
            "is_active",
            "meta_data",
        ]


class UploadUserDataSerializer(serializers.Serializer):
    """Serializer for file upload validation"""

    pnl_file = serializers.FileField(
        required=False, help_text="P&L template file"
    )
    transactions_file = serializers.FileField(
        required=False, help_text="Transactions template file"
    )
    invoices_file = serializers.FileField(
        required=False, help_text="Invoices template file"
    )

    # PnL metadata fields
    pnl_date_column = serializers.CharField(
        required=False,
        help_text="Column name for dates in PnL file",
        max_length=100
    )
    pnl_expense_columns = serializers.CharField(
        required=False,
        help_text="Comma-separated expense columns (e.g., 'COGS,Payroll')"
    )
    pnl_revenue_columns = serializers.CharField(
        required=False,
        help_text="Comma-separated revenue columns (e.g., 'Revenue,Sales')"
    )

    def validate(self, attrs):
        """Validate uploaded files"""
        uploaded_files = []
        max_file_size = 20 * 1024 * 1024  # 20 MB in bytes

        # Define file fields to check (exclude metadata fields)
        file_fields = ['pnl_file', 'transactions_file', 'invoices_file']
        
        # Collect uploaded files and validate size
        for field_name in file_fields:
            file = attrs.get(field_name)
            if file:
                # Check if it's actually a file object
                if hasattr(file, 'size'):
                    # Check file size
                    if file.size > max_file_size:
                        raise serializers.ValidationError(FILE_SIZE_EXCEEDED)
                    uploaded_files.append(file)

        if not uploaded_files:
            raise serializers.ValidationError(NO_FILES_PROVIDED, HTTP_400_BAD_REQUEST)

        # Validate file formats
        is_valid, error_message, file_template_mapping = (
            FileFormatValidator.validate_multiple_files(uploaded_files)
        )

        if not is_valid:
            # Check if error_message is our custom format
            if isinstance(error_message, dict) and "message" in error_message:
                raise serializers.ValidationError(error_message)
            else:
                raise serializers.ValidationError(error_message)

        # Store validation results for use in view
        attrs["_uploaded_files"] = uploaded_files
        attrs["_file_template_mapping"] = file_template_mapping

        # Convert comma-separated strings to lists for metadata fields
        if "pnl_expense_columns" in attrs and attrs["pnl_expense_columns"]:
            attrs["pnl_expense_columns"] = [
                col.strip() for col in attrs["pnl_expense_columns"].split(",")
                if col.strip()
            ]

        if "pnl_revenue_columns" in attrs and attrs["pnl_revenue_columns"]:
            attrs["pnl_revenue_columns"] = [
                col.strip() for col in attrs["pnl_revenue_columns"].split(",")
                if col.strip()
            ]

        return attrs


class UploadUserDataResponseSerializer(serializers.Serializer):
    """Serializer for file upload response"""

    success = serializers.BooleanField()
    message = serializers.CharField()
    uploaded_files = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    errors = serializers.ListField(child=serializers.CharField(), required=False)
