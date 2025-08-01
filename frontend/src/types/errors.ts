export interface FormErrors {
    name?: string;
    surname?: string;
    email?: string;
    username?: string;
    bio?: string;
    password?: string;
    confirmPassword?: string
  }
  export interface ApiError {
  message: string;
  status: number;
  field?: string;
  fieldErrors?: Record<string, string[]>;
  nonFieldErrors?: string[]; 
  errorType?: string; 
  errorCode?: string; 
}

// Django DRF error response formats
export interface DjangoErrorResponseFormat1 {
  error: boolean;
  error_type: string;
  message: string;
  timestamp: string;
  details?: {
    field_errors?: Record<string, string[]>;
    [key: string]: any;
  };
}

export interface DjangoErrorResponseFormat2 {
  success: boolean;
  error_code: string;
  message: string;
  timestamp: string;
  path: string;
  details?: {
    field_errors?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    non_field_errors?: string[];
    [key: string]: any;
  };
}

export type DjangoErrorResponse = DjangoErrorResponseFormat1 | DjangoErrorResponseFormat2;