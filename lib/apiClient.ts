/** Result of a safe API fetch call */
export interface FetchResult<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Safe, type-friendly client fetch wrapper.
 * - Handles JSON parsing safely without throwing on non-JSON/HTML 500 pages.
 * - Extracts error messages from standard `{ error: ... }` or `{ message: ... }` responses.
 * - Gracefully catches network errors and offline states.
 */
export async function safeApiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<FetchResult<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      return {
        ok: false,
        data: null,
        error: res.ok ? 'Unexpected non-JSON response' : `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    const body = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        data: null,
        error: body?.error || body?.message || 'An unexpected error occurred.',
        status: res.status,
      };
    }

    return {
      ok: true,
      data: body as T,
      error: null,
      status: res.status,
    };
  } catch {
    return {
      ok: false,
      data: null,
      error: 'Network connection error. Please check your internet connection.',
      status: 0,
    };
  }
}
