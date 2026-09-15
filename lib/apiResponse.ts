import { NextResponse } from 'next/server';

/** Canonical error response shape */
export interface ApiErrorBody {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

/** Canonical success response shape (Flat / Direct payload) */
export type ApiSuccessBody<T> = T;

/** Unified API Response type */
export type ApiResponse<T> = ApiSuccessBody<T> | ApiErrorBody;

/**
 * Standard 200 OK (or custom 2xx) success response.
 * Returns the payload directly without altering existing properties.
 */
export function apiSuccess<T>(
  data: T,
  init?: ResponseInit
): NextResponse<T> {
  return NextResponse.json(data, { status: 200, ...init });
}

/**
 * Standard 201 Created success response.
 */
export function apiCreated<T>(
  data: T,
  init?: ResponseInit
): NextResponse<T> {
  return NextResponse.json(data, { status: 201, ...init });
}

/**
 * Standardized error response.
 * Ensures consistent `{ success: false, error: string, code?: string, details?: unknown }` shape.
 */
export function apiError(
  message: string,
  status: number = 400,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = {
    success: false,
    error: message,
  };

  if (code) {
    body.code = code;
  }

  if (details !== undefined) {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}

// Semantic convenience helpers for common HTTP status codes
export const apiBadRequest = (msg = 'Bad Request', code?: string, details?: unknown) =>
  apiError(msg, 400, code ?? 'BAD_REQUEST', details);

export const apiUnauthorized = (msg = 'Unauthorized', code?: string) =>
  apiError(msg, 401, code ?? 'UNAUTHORIZED');

export const apiForbidden = (msg = 'Forbidden', code?: string) =>
  apiError(msg, 403, code ?? 'FORBIDDEN');

export const apiNotFound = (msg = 'Not Found', code?: string) =>
  apiError(msg, 404, code ?? 'NOT_FOUND');

export const apiConflict = (msg = 'Conflict', code?: string) =>
  apiError(msg, 409, code ?? 'CONFLICT');

export const apiServerError = (msg = 'Internal Server Error', err?: unknown) => {
  if (err) {
    console.error('[API Server Error]:', err);
  }
  return apiError(msg, 500, 'INTERNAL_SERVER_ERROR');
};
