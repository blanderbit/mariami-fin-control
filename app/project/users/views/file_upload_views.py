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
    UploadUserDataResponseSerializer
)
from users.models.user_data_file import UserDataFile
from config.instances.minio_client import MINIO_CLIENT


class UploadUserDataAPIView(APIView):
    """API View for uploading user data files"""
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    
    @swagger_auto_schema(
        request_body=UploadUserDataSerializer,
        responses={
            200: UploadUserDataResponseSerializer,
            400: 'Bad Request',
            401: 'Unauthorized'
        },
        operation_description="Upload user data files (P&L, Transactions, Invoices)",
        tags=['File Upload']
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
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Ошибка валидации',
                'errors': list(serializer.errors.values())
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            uploaded_files_info = []
            user_id = request.user.id
            
            # Get validated data
            file_template_mapping = serializer.validated_data['_file_template_mapping']
            uploaded_files = serializer.validated_data['_uploaded_files']
            
            # Upload each file to MinIO
            for file in uploaded_files:
                template_type = file_template_mapping[file.name]
                
                # Delete existing files of the same template type
                deleted = MINIO_CLIENT.delete_user_files_by_template(
                    user_id,
                    template_type
                )
                if deleted:
                    print(
                        f"Deleted existing {template_type} files "
                        f"for user {user_id}"
                    )
                
                # Generate unique filename with timestamp
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                file_extension = file.name.split('.')[-1]
                unique_filename = (
                    f"{template_type}_{timestamp}.{file_extension}"
                )
                
                # Get user folder path
                user_folder = MINIO_CLIENT.get_user_folder_path(
                    user_id,
                    "data_uploads"
                )
                object_name = f"{user_folder}/{unique_filename}"
                
                # Upload file to MinIO
                file.seek(0)  # Reset file pointer
                MINIO_CLIENT.upload_file(
                    bucket_name="user-data",
                    object_name=object_name,
                    file_data=file,
                    file_size=file.size,
                    content_type=file.content_type
                )
                
                # Create or update database record
                user_data_file, created = (
                    UserDataFile.objects.update_or_create(
                        user=request.user,
                        template_type=template_type,
                        is_active=True,
                        defaults={
                            'original_filename': file.name,
                            'stored_filename': unique_filename,
                            'file_path': object_name,
                            'file_size': file.size,
                            'upload_time': datetime.datetime.now()
                        }
                    )
                )
                
                uploaded_files_info.append({
                    'original_name': file.name,
                    'stored_name': unique_filename,
                    'template_type': template_type,
                    'file_path': object_name,
                    'upload_time': datetime.datetime.now().isoformat(),
                    'created_new': created,
                    'replaced_existing': deleted
                })
            
            return Response({
                'success': True,
                'message': (
                    f'Успешно загружено {len(uploaded_files_info)} '
                    f'файл(ов)'
                ),
                'uploaded_files': uploaded_files_info
            }, status=status.HTTP_200_OK)
            
        except ValidationError as e:
            # Re-raise DRF validation errors
            raise e
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Ошибка при загрузке файлов: {str(e)}',
                'errors': [str(e)]
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
