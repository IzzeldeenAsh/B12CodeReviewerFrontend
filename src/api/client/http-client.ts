import { type z } from 'zod';
import { env } from '@/config/env';
import { getTokenProvider } from '@/auth/token-provider';
import { ApiError, apiErrorFromProblem } from '../errors/api-error';

/**
 * The single typed HTTP boundary to the backend (§8). Everything the app sends
 * to or receives from the server passes through here:
 *  - base URL from validated env,
 *  - bearer token / test headers injected centrally (never in components),
 *  - a per-request correlation id echoed to logs,
 *  - RFC 7807 problem+json parsed into a typed ApiError,
 *  - AbortController cancellation,
 *  - Zod validation of the response body.
 *
 * The browser talks ONLY to this backend — never directly to Azure DevOps or
 * Anthropic.
 */
export interface RequestOptions<T> {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** Response contract. Omit for 204/no-content. */
  schema?: z.ZodType<T>;
  signal?: AbortSignal;
  /** Correlation id to reuse (otherwise one is generated). */
  correlationId?: string;
}

function newCorrelationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `cid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const provider = getTokenProvider();
  if (!provider) return {};
  return provider.getAuthHeaders();
}

export async function request<T = void>(path: string, options: RequestOptions<T> = {}): Promise<T> {
  const { method = 'GET', body, schema, signal } = options;
  const correlationId = options.correlationId ?? newCorrelationId();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Correlation-Id': correlationId,
    ...(await authHeaders()),
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${env.apiBaseUrl}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw ApiError.aborted();
    }
    throw ApiError.network();
  }

  const responseCorrelationId = response.headers.get('X-Correlation-Id') ?? correlationId;

  if (response.status === 401) {
    getTokenProvider()?.onUnauthenticated?.();
  }

  if (!response.ok) {
    const problemBody = await safeJson(response);
    throw apiErrorFromProblem(response.status, problemBody, responseCorrelationId);
  }

  // No body expected (e.g. 204 delete).
  if (!schema || response.status === 204) {
    return undefined as T;
  }

  const json = await safeJson(response);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError('parse', 'Response failed contract validation.', {
      status: response.status,
      correlationId: responseCorrelationId,
    });
  }
  return parsed.data;
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
