// types/errors.ts

export interface IApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface IApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string>;
}
// utils/errorHandler.ts
export interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "response" in error;
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.message || error.message || "একটি সমস্যা হয়েছে।"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "একটি অপ্রত্যাশিত সমস্যা হয়েছে।";
}
