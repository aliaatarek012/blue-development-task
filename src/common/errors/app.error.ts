import { HttpStatus } from '../types/http-status';
import { ErrorCode } from './error-codes';

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Base class for errors that are safe to expose to API clients.
 * Anything not extending AppError is treated as an unexpected 500.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: HttpStatus;

  protected constructor(
    message: string,
    public readonly code: ErrorCode | string,
    public readonly details?: FieldError[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor(message = 'Bad request', code: ErrorCode | string = ErrorCode.BAD_REQUEST, details?: FieldError[]) {
    super(message, code, details);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor(details: FieldError[], message = 'Request validation failed') {
    super(message, ErrorCode.VALIDATION_ERROR, details);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = HttpStatus.NOT_FOUND;

  constructor(message = 'Resource not found', code: ErrorCode | string = ErrorCode.NOT_FOUND) {
    super(message, code);
  }
}
