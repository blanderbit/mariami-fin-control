"""File upload related error constants"""

# Validation errors
FILE_SIZE_EXCEEDED = {
    "code": "file_size_exceeded",
    "message": "File exceeds maximum size limit"
}

NO_FILES_PROVIDED = {
    "code": "no_files_provided",
    "message": "At least one file must be uploaded"
}

INVALID_FILE_FORMAT = {
    "code": "invalid_file_format",
    "message": "Unsupported file format"
}

UNKNOWN_TEMPLATE_TYPE = {
    "code": "unknown_template_type",
    "message": "Unknown file template type"
}

# Upload errors
UPLOAD_FAILED = {
    "code": "upload_failed",
    "message": "Failed to upload file"
}

MINIO_CONNECTION_ERROR = {
    "code": "storage_connection_error",
    "message": "Storage connection error"
}
