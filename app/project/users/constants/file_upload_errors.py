"""File upload related error constants"""

# Validation errors
FILE_SIZE_EXCEEDED = {
    "message": "Файл превышает максимальный размер",
    "code": "file_size_exceeded"
}

NO_FILES_PROVIDED = {
    "message": "Необходимо загрузить хотя бы один файл", 
    "code": "no_files_provided"
}

INVALID_FILE_FORMAT = {
    "message": "Неподдерживаемый формат файла",
    "code": "invalid_file_format"
}

UNKNOWN_TEMPLATE_TYPE = {
    "message": "Неизвестный тип шаблона файла",
    "code": "unknown_template_type"
}

# Upload errors
UPLOAD_FAILED = {
    "message": "Ошибка при загрузке файла",
    "code": "upload_failed"
}

MINIO_CONNECTION_ERROR = {
    "message": "Ошибка подключения к хранилищу",
    "code": "storage_connection_error"
}
