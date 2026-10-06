import type { FieldError } from '../errors';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  message: string;
  code: string;
  details?: FieldError[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}
