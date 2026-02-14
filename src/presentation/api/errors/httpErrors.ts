import type { ErrorResponse } from "../../../domain/shared/contracts.js";

export interface HttpError extends ErrorResponse {
  statusCode: number;
}

const DEFAULT_MESSAGE = "Unexpected error.";

const STATUS_BY_ERROR_CODE: Record<string, number> = {
  INVALID_REPOSITORY_INPUT: 400,
  INVALID_JOB_TRANSITION: 409,
  JOB_TERMINAL: 409,
  JOB_NOT_FOUND: 404,
  JOB_NOT_COMPLETED: 409,
};

const sanitizeMessage = (message: string | undefined): string => {
  if (!message) {
    return DEFAULT_MESSAGE;
  }

  return message.replace(/gh[pousr]_[A-Za-z0-9_]+/g, "[redacted-token]").slice(0, 500);
};

export function toHttpError(input: {
  errorCode?: string;
  message?: string;
  statusCode?: number;
}): HttpError {
  const errorCode = input.errorCode ?? "INTERNAL_ERROR";
  const statusCode = input.statusCode ?? STATUS_BY_ERROR_CODE[errorCode] ?? 500;
  return {
    errorCode,
    statusCode,
    message: sanitizeMessage(input.message),
  };
}

