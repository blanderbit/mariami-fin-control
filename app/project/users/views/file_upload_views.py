import datetime
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.serializers import ValidationError
from drf_yasg.utils import swagger_auto_schema
from rest_framework.parsers import MultiPartParser

from users.serializers.file_upload_serializers import (
    UploadUserDataSerializer,
    UploadUserDataResponseSerializer,
)
from users.models import UserDataFile, UserModel
from config.instances.minio_client import MINIO_CLIENT
from users.services.financial_analysis_service import UserPNLAnalysisService
from users.services.expense_breakdown_service import (
    UserExpenseBreakdownService
)
from users.services.cash_analysis_service import UserCashAnalysisService
from users.services.invoices_analysis_service import (
    UserInvoicesAnalysisService
)


class UploadUserDataAPIView(APIView):
    """API View for uploading user data files"""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def _invalidate_cache_by_template_type(self, user, template_type):
        """
        Invalidate cache based on the template type of uploaded file.
        
        Args:
            user: User instance
            template_type: Type of template (pnl_template, etc.)
        """
        try:
            if template_type == UserDataFile.TemplateType.PNL_TEMPLATE:
                # Invalidate PnL analysis cache
                pnl_service = UserPNLAnalysisService(user)
                pnl_service.invalidate_cache()
                
                # Invalidate expense breakdown cache (depends on PnL data)
                expense_service = UserExpenseBreakdownService(user)
                expense_service.invalidate_cache()
                
            elif (template_type ==
                  UserDataFile.TemplateType.TRANSACTIONS_TEMPLATE):
                # Invalidate cash analysis cache
                cash_service = UserCashAnalysisService(user)
                cash_service.invalidate_cache()
                
            elif template_type == UserDataFile.TemplateType.INVOICES_TEMPLATE:
                # Invalidate invoices analysis cache
                invoices_service = UserInvoicesAnalysisService(user)
                invoices_service.invalidate_cache()
                
        except Exception as e:
            # Log error but don't fail the upload
            print(f"Failed to invalidate cache for {template_type}: {str(e)}")

    def _prepare_pnl_metadata(self, validated_data):
        """
        Prepare metadata for PnL files from request data.
        
        Args:
            validated_data: Validated serializer data
            
        Returns:
            dict or None: PnL metadata if provided
        """
        meta_data = {}
        
        # Get PnL-specific metadata fields
        date_column = validated_data.get('pnl_date_column')
        expense_columns = validated_data.get('pnl_expense_columns', [])
        revenue_columns = validated_data.get('pnl_revenue_columns', [])
        
        if date_column:
            meta_data['date_column'] = date_column
            
        if expense_columns:
            meta_data['expense_columns'] = expense_columns
            
        if revenue_columns:
            meta_data['revenue_columns'] = revenue_columns
            
        # Return None if no metadata was provided
        return meta_data if meta_data else None

    @swagger_auto_schema(
        request_body=UploadUserDataSerializer,
        responses={
            200: UploadUserDataResponseSerializer,
            400: "Bad Request",
            401: "Unauthorized",
        },
        operation_description="Upload user data files (P&L, Transactions, Invoices)",
        tags=["File Upload"],
    )
    def post(self, request):
        """
        Upload user data files to MinIO storage

        Accepts CSV or Excel files in three formats:
        - pnl_template: P&L data
        - transactions_template: Transaction data
        - invoices_template: Invoice data

        Files are validated before upload and stored in user's private bucket.
        """

        serializer = UploadUserDataSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uploaded_files_info = []
            user_id = request.user.id

            # Get validated data
            file_template_mapping = serializer.validated_data["_file_template_mapping"]
            uploaded_files = serializer.validated_data["_uploaded_files"]

            # Upload each file to MinIO
            for file in uploaded_files:
                template_type = file_template_mapping[file.name]

                # Delete existing files of the same template type
                deleted = MINIO_CLIENT.delete_user_files_by_template(
                    user_id, template_type
                )
                if deleted:
                    print(
                        f"Deleted existing {template_type} files " f"for user {user_id}"
                    )

                # Generate unique filename with timestamp
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                file_extension = file.name.split(".")[-1]
                unique_filename = f"{template_type}_{timestamp}.{file_extension}"

                # Get user folder path
                user_folder = MINIO_CLIENT.get_user_folder_path(user_id, "data_uploads")
                object_name = f"{user_folder}/{unique_filename}"

                # Upload file to MinIO
                file.seek(0)  # Reset file pointer
                MINIO_CLIENT.upload_file(
                    bucket_name='user-data',
                    object_name=object_name,
                    file_data=file,
                    file_size=file.size,
                    content_type=file.content_type,
                )

                # Prepare metadata for PnL files
                meta_data = None
                if template_type == UserDataFile.TemplateType.PNL_TEMPLATE:
                    meta_data = self._prepare_pnl_metadata(
                        serializer.validated_data
                    )

                # Create or update database record
                user_data_file, created = UserDataFile.objects.update_or_create(
                    user=request.user,
                    template_type=template_type,
                    is_active=True,
                    defaults={
                        "original_filename": file.name,
                        "stored_filename": unique_filename,
                        "file_path": object_name,
                        "file_size": file.size,
                        "upload_time": datetime.datetime.now(),
                        "meta_data": meta_data,
                    },
                )

                # Invalidate relevant caches based on template type
                self._invalidate_cache_by_template_type(
                    request.user, template_type
                )

                uploaded_files_info.append(
                    {
                        "original_name": file.name,
                        "stored_name": unique_filename,
                        "template_type": template_type,
                        "file_path": object_name,
                        "upload_time": datetime.datetime.now().isoformat(),
                        "created_new": created,
                        "replaced_existing": deleted,
                        "meta_data": meta_data,
                    }
                )

            return Response(
                {
                    "success": True,
                    "message": (
                        f"Успешно загружено {len(uploaded_files_info)} " f"файл(ов)"
                    ),
                    "uploaded_files": uploaded_files_info,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            # Re-raise DRF validation errors
            raise e
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": f"Ошибка при загрузке файлов: {str(e)}",
                    "errors": [str(e)],
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
