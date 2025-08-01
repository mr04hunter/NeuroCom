import { ApiError, DjangoErrorResponse } from "../types/errors";

export const handleApiError = (error: any): ApiError => {
  console.log('Processing error:', error);

  // Handle axios errors with Django DRF responses
  if (error.response?.data) {
    const data = error.response.data;
    const status = error.response.status;

    // Check if it's a Django error response
    if (isDjangoErrorResponse(data)) {
      return processDjangoError(data, status);
    }

    if (data.errors && Array.isArray(data.errors)) {
      return {
        message: data.errors[0] || 'Server error',
        status: status,
        field: data.field
      };
    }

    // Handle generic error responses
    return {
      message: data.message || data.detail || 'Server error',
      status: status
    };
  }


  if (error.request) {
    console.log("ERROR REQUEST");
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    status: 500
  };
};

// Helper function to detect Django error response format
const isDjangoErrorResponse = (data: any): data is DjangoErrorResponse => {
  return (
    (typeof data === 'object' && data !== null) &&
    (
      // Format 1: ErrorResponse class
      (data.error === false || data.error === true) ||
      // Format 2: handlers.py format
      (data.success === false || data.success === true)
    )
  );
};


const processDjangoError = (data: DjangoErrorResponse, status: number): ApiError => {
  const apiError: ApiError = {
    message: data.message,
    status: status,
    fieldErrors: {},
    nonFieldErrors: []
  };

  // Handle Format 1 (ErrorResponse class)
  if ('error' in data && typeof data.error === 'boolean') {
    apiError.errorType = data.error_type;
    
    if (data.details?.field_errors) {
      apiError.fieldErrors = data.details.field_errors;
    }
  }
  // Handle Format 2 (handlers.py)
  else if ('success' in data && typeof data.success === 'boolean') {
    apiError.errorCode = data.error_code;
    
    if (data.details?.field_errors) {
      // Convert array format to record format
      const fieldErrors: Record<string, string[]> = {};
      data.details.field_errors.forEach(fieldError => {
        if (!fieldErrors[fieldError.field]) {
          fieldErrors[fieldError.field] = [];
        }
        fieldErrors[fieldError.field].push(fieldError.message);
      });
      apiError.fieldErrors = fieldErrors;
    }
    
    if (data.details?.non_field_errors) {
      apiError.nonFieldErrors = data.details.non_field_errors;
    }
  }

  return apiError;
};