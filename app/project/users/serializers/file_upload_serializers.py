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
    pnl_expense_columns = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        help_text="List of expense column names"
    )
    pnl_revenue_columns = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        help_text="List of revenue column names"
    )

    def validate(self, attrs):
        """Validate uploaded files"""
        uploaded_files = []
        max_file_size = 20 * 1024 * 1024  # 20 MB in bytes

        # Collect uploaded files and validate size
        for field_name, file in attrs.items():
            if file:
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

        return attrs


class UploadUserDataResponseSerializer(serializers.Serializer):
    """Serializer for file upload response"""

    success = serializers.BooleanField()
    message = serializers.CharField()
    uploaded_files = serializers.ListField(
        child=serializers.DictField(), required=False
    )
    errors = serializers.ListField(child=serializers.CharField(), required=False)
