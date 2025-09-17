from rest_framework.renderers import JSONRenderer


class CustomRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = renderer_context["response"].status_code
        response = {
            "status": "success",
            "code": status_code,
            "data": data,
            "message": None,
        }

        return super(CustomRenderer, self).render(
            response, accepted_media_type, renderer_context
        )

        if not str(status_code).startswith("2"):
            response["status"] = "error"
            response["data"] = self._process_error_data(data)
            
            # Try to extract main error message
            if isinstance(data, dict) and "message" in data:
                response["message"] = data["message"]
            elif isinstance(data, dict) and "detail" in data:
                response["message"] = data["detail"]

        return super(CustomRenderer, self).render(
            response, accepted_media_type, renderer_context
        )

    # def _process_error_data(self, data):
    #     """Process error data to ensure consistent format"""
    #     if not isinstance(data, dict):
    #         return data
            
    #     processed_data = data.copy()
        
    #     # Handle 'errors' field containing our custom error structure
    #     if "errors" in processed_data:
    #         processed_data["errors"] = self._normalize_errors(
    #             processed_data["errors"]
    #         )
        
    #     # Handle DRF validation errors (field-specific errors)
    #     drf_errors = []
    #     for key, value in data.items():
    #         if key not in ["success", "message", "errors", "detail"]:
    #             # This looks like a DRF field error
    #             field_errors = self._process_drf_field_errors(key, value)
    #             drf_errors.extend(field_errors)
        
    #     # Add DRF errors to our errors list
    #     if drf_errors:
    #         if "errors" not in processed_data:
    #             processed_data["errors"] = []
    #         elif not isinstance(processed_data["errors"], list):
    #             processed_data["errors"] = [processed_data["errors"]]
    #         processed_data["errors"].extend(drf_errors)
            
    #         # Remove DRF field keys from response
    #         for key in list(processed_data.keys()):
    #             if key not in ["success", "message", "errors", "detail"]:
    #                 del processed_data[key]

    #     return processed_data

    # def _normalize_errors(self, errors):
    #     """Normalize errors to consistent format with code and message"""
    #     if not isinstance(errors, list):
    #         return errors
            
    #     normalized_errors = []
        
    #     for error in errors:
    #         if (isinstance(error, dict) and
    #                 "code" in error and "message" in error):
    #             # Already in correct format
    #             normalized_errors.append(error)
    #         elif isinstance(error, list) and len(error) == 2:
    #             # Legacy format: [code, message]
    #             normalized_errors.append({
    #                 "code": error[0],
    #                 "message": error[1]
    #             })
    #         elif isinstance(error, list):
    #             # Handle list of ErrorDetail objects or mixed content
    #             for item in error:
    #                 normalized_errors.append(self._process_error_item(item))
    #         elif isinstance(error, dict):
    #             # DRF-style error dict
    #             normalized_errors.append(self._convert_drf_error(error))
    #         elif isinstance(error, str):
    #             # Plain string error
    #             normalized_errors.append({
    #                 "code": "validation_error",
    #                 "message": error
    #             })
    #         else:
    #             # Handle ErrorDetail objects and other formats
    #             normalized_errors.append(self._process_error_item(error))
                
    #     return normalized_errors

    # def _process_error_item(self, item):
    #     """Process individual error item (handles ErrorDetail objects)"""
    #     # Check if it's an ErrorDetail object
    #     if hasattr(item, 'code') and hasattr(item, '__str__'):
    #         # This is likely an ErrorDetail object
    #         return {
    #             "code": getattr(item, 'code', 'validation_error'),
    #             "message": str(item)
    #         }
    #     elif isinstance(item, dict):
    #         return self._convert_drf_error(item)
    #     elif isinstance(item, str):
    #         return {
    #             "code": "validation_error",
    #             "message": item
    #         }
    #     else:
    #         return {
    #             "code": "unknown_error",
    #             "message": str(item)
    #         }

    # def _process_drf_field_errors(self, field_name, field_errors):
    #     """Process DRF field-specific errors"""
    #     errors = []
        
    #     if not isinstance(field_errors, list):
    #         field_errors = [field_errors]
            
    #     for error in field_errors:
    #         if isinstance(error, str):
    #             errors.append({
    #                 "code": f"{field_name}_error",
    #                 "message": error
    #             })
    #         elif isinstance(error, dict):
    #             converted_error = self._convert_drf_error(error)
    #             converted_error["code"] = (
    #                 f"{field_name}_{converted_error['code']}"
    #             )
    #             errors.append(converted_error)
    #         else:
    #             errors.append({
    #                 "code": f"{field_name}_error",
    #                 "message": str(error)
    #             })
                
    #     return errors

    # def _convert_drf_error(self, error_dict):
    #     """Convert DRF error dict to our format"""
    #     if isinstance(error_dict, dict):
    #         # Check for common DRF error patterns
    #         if "detail" in error_dict:
    #             return {
    #                 "code": error_dict.get("code", "validation_error"),
    #                 "message": error_dict["detail"]
    #             }
    #         elif "message" in error_dict:
    #             return {
    #                 "code": error_dict.get("code", "validation_error"),
    #                 "message": error_dict["message"]
    #             }
    #         else:
    #             # Try to extract meaningful info
    #             code = error_dict.get("code", "validation_error")
    #             message = error_dict.get("message", str(error_dict))
    #             return {
    #                 "code": code,
    #                 "message": message
    #             }
    #     else:
    #         return {
    #             "code": "validation_error",
    #             "message": str(error_dict)
    #         }
