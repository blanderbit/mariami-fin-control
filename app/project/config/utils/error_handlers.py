"""
Error handling utilities for consistent error responses across the application.

This module provides utilities to create standardized error responses that work
with the CustomRenderer and maintain consistency across all API endpoints.
"""

from typing import Optional, Union, List, Dict
from rest_framework.response import Response
from rest_framework import status


def create_error_response(
    errors: Union[str, List[Dict[str, str]]],
    status_code: int = status.HTTP_400_BAD_REQUEST,
    message: Optional[str] = None
) -> Response:
    """
    Create standardized error response for analysis endpoints.
    
    This function creates error responses that work with CustomRenderer to
    provide consistent error format across the application:
    {
        "status": "error",
        "code": status_code,
        "data": {
            "errors": [
                {
                    "code": "error_code",
                    "detail": "Error description",
                    "attr": "field_name" (optional)
                }
            ]
        },
        "message": "Optional main error message"
    }
    
    Args:
        errors: Either a string error message or list of error dictionaries
        status_code: HTTP status code (default: 400)
        message: Optional main error message
        
    Returns:
        Response object with standardized error structure
    """
    
    # Convert string error to standard format
    if isinstance(errors, str):
        error_list = [{
            "code": _get_error_code_from_status(status_code),
            "detail": errors
        }]
    elif isinstance(errors, list):
        error_list = []
        for error in errors:
            if isinstance(error, str):
                error_list.append({
                    "code": _get_error_code_from_status(status_code),
                    "detail": error
                })
            elif isinstance(error, dict):
                # Ensure required fields exist
                normalized_error = {
                    "code": error.get(
                        "code", _get_error_code_from_status(status_code)
                    ),
                    "detail": error.get("detail", str(error))
                }
                if "attr" in error:
                    normalized_error["attr"] = error["attr"]
                error_list.append(normalized_error)
            else:
                error_list.append({
                    "code": _get_error_code_from_status(status_code),
                    "detail": str(error)
                })
    else:
        error_list = [{
            "code": _get_error_code_from_status(status_code),
            "detail": str(errors)
        }]
    
    response_data = {
        "errors": error_list
    }
    
    return Response(response_data, status=status_code)


def create_validation_error_response(
    field_errors: Dict[str, Union[str, List[str]]],
    message: Optional[str] = None
) -> Response:
    """
    Create standardized validation error response for form/serializer errors.
    
    Args:
        field_errors: Dictionary mapping field names to error messages
        message: Optional main validation message
        
    Returns:
        Response object with validation errors in standard format
    """
    error_list = []
    
    for field_name, field_error_data in field_errors.items():
        if isinstance(field_error_data, str):
            error_list.append({
                "code": "validation_error",
                "detail": field_error_data,
                "attr": field_name
            })
        elif isinstance(field_error_data, list):
            for error_msg in field_error_data:
                error_list.append({
                    "code": "validation_error",
                    "detail": str(error_msg),
                    "attr": field_name
                })
    
    return create_error_response(
        error_list,
        status_code=status.HTTP_400_BAD_REQUEST,
        message=message
    )


def create_not_found_error_response(
    resource_name: str,
    message: Optional[str] = None
) -> Response:
    """
    Create standardized 404 error response.
    
    Args:
        resource_name: Name of the resource that was not found
        message: Optional custom message
        
    Returns:
        Response object with 404 error in standard format
    """
    error_detail = message or f"{resource_name} not found"
    
    return create_error_response(
        [{
            "code": "not_found",
            "detail": error_detail,
            "attr": resource_name.lower()
        }],
        status_code=status.HTTP_404_NOT_FOUND,
        message=message
    )


def create_server_error_response(
    error_message: Optional[str] = None,
    log_error: bool = True
) -> Response:
    """
    Create standardized 500 error response.
    
    Args:
        error_message: Optional specific error message
        log_error: Whether to log the error (default: True)
        
    Returns:
        Response object with 500 error in standard format
    """
    detail = error_message or "An internal server error occurred"
    
    return create_error_response(
        [{
            "code": "internal_server_error",
            "detail": detail
        }],
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _get_error_code_from_status(status_code: int) -> str:
    """
    Get appropriate error code based on HTTP status code.
    
    Args:
        status_code: HTTP status code
        
    Returns:
        String error code
    """
    error_codes = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        422: "validation_error",
        500: "internal_server_error"
    }
    
    return error_codes.get(status_code, "unknown_error")