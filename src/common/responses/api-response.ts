import type { Response } from 'express';
import { HttpStatus } from '../types/http-status';
import type { ApiErrorBody, ApiErrorResponse, ApiSuccessResponse } from '../types/api-response.types';

export function sendSuccess<T>(res: Response, data: T, statusCode: HttpStatus = HttpStatus.OK): Response {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return res.status(statusCode).json(body);
}

export function sendNoContent(res: Response): Response {
  return res.status(HttpStatus.NO_CONTENT).send();
}

export function sendError(res: Response, statusCode: HttpStatus, error: ApiErrorBody): Response {
  const body: ApiErrorResponse = { success: false, error };
  return res.status(statusCode).json(body);
}
