import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodError, ZodTypeAny } from 'zod';
import { ValidationError, type FieldError } from '../common/errors';

export interface RequestSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
}

type RequestPart = keyof RequestSchemas;

function toFieldErrors(error: ZodError, part: RequestPart): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join('.') : part,
    message: issue.message,
  }));
}

/**
 * Validates request parts against Zod schemas before the controller runs.
 * The parsed (sanitized) body replaces req.body so unknown fields never reach the service.
 */
export function validateRequest(schemas: RequestSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const fieldErrors: FieldError[] = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) fieldErrors.push(...toFieldErrors(result.error, 'params'));
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body ?? {});
      if (result.success) {
        req.body = result.data;
      } else {
        fieldErrors.push(...toFieldErrors(result.error, 'body'));
      }
    }

    if (fieldErrors.length > 0) {
      next(new ValidationError(fieldErrors));
      return;
    }

    next();
  };
}
