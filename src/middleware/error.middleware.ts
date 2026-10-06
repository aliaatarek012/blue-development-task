import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import { AppError, BadRequestError, ErrorCode, NotFoundError, ValidationError } from '../common/errors';
import { sendError } from '../common/responses/api-response';
import { HttpStatus } from '../common/types/http-status';

interface BodyParserError extends Error {
  type?: string;
}

function isJsonParseError(error: unknown): error is BodyParserError {
  return error instanceof SyntaxError && (error as BodyParserError).type === 'entity.parse.failed';
}

/**
 * Translates known infrastructure errors into AppErrors so that
 * a single code path builds every client-facing error response.
 */
function normalizeError(error: unknown): AppError | null {
  if (error instanceof AppError) return error;

  if (isJsonParseError(error)) {
    return new BadRequestError('Malformed JSON in request body', ErrorCode.INVALID_JSON);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new BadRequestError(`Invalid value for field '${error.path}'`);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return new ValidationError(
      Object.values(error.errors).map((fieldError) => ({ field: fieldError.path, message: fieldError.message })),
    );
  }

  return null;
}

export const notFoundHandler: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, ErrorCode.ROUTE_NOT_FOUND));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next): void => {
  const appError = normalizeError(error);

  if (appError) {
    sendError(res, appError.statusCode, {
      message: appError.message,
      code: appError.code,
      ...(appError.details && { details: appError.details }),
    });
    return;
  }

  console.error('[error] unhandled error:', error);
  sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, {
    message: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
  });
};
