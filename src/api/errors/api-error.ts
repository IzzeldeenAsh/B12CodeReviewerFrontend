import { problemDetailsSchema, type ProblemDetailsWire } from '../contracts/schemas';

/**
 * A single typed error for everything the API boundary can produce. Components
 * and hooks branch on `kind` / `status`, never on string matching. Raw backend
 * detail is preserved for logging but user-facing copy is derived centrally in
 * `messageForError` so tokens, stack traces, and provider text never surface.
 */
export type ApiErrorKind =
  | 'validation' // 400
  | 'unauthenticated' // 401
  | 'forbidden' // 403
  | 'notFound' // 404
  | 'conflict' // 409 (generic)
  | 'stale' // 409 stale-review
  | 'duplicate' // 409 duplicate-action
  | 'limitExceeded' // 413
  | 'unprocessable' // 422
  | 'rateLimited' // 429
  | 'upstreamFailure' // 502
  | 'upstreamUnavailable' // 503
  | 'server' // other 5xx
  | 'network' // fetch failed / offline
  | 'aborted' // request cancelled
  | 'parse' // response failed contract validation
  | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly problem?: ProblemDetailsWire;
  readonly correlationId?: string;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; problem?: ProblemDetailsWire; correlationId?: string },
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options?.status ?? 0;
    this.problem = options?.problem;
    this.correlationId = options?.correlationId;
  }

  static aborted(): ApiError {
    return new ApiError('aborted', 'Request was cancelled.');
  }

  static network(): ApiError {
    return new ApiError('network', 'Network request failed.', { status: 0 });
  }

  /** Transient read failures are the only thing we let TanStack Query retry. */
  get isRetryable(): boolean {
    return (
      this.kind === 'network' ||
      this.kind === 'rateLimited' ||
      this.kind === 'upstreamUnavailable' ||
      this.status === 503
    );
  }
}

const KIND_BY_TYPE: Record<string, ApiErrorKind> = {
  'stale-review': 'stale',
  'duplicate-action': 'duplicate',
  'pr-limit-exceeded': 'limitExceeded',
  'invalid-publish-selection': 'unprocessable',
};

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
  400: 'validation',
  401: 'unauthenticated',
  403: 'forbidden',
  404: 'notFound',
  409: 'conflict',
  413: 'limitExceeded',
  422: 'unprocessable',
  429: 'rateLimited',
  502: 'upstreamFailure',
  503: 'upstreamUnavailable',
};

/** Map a validated Problem Details payload (or bare status) to a typed error. */
export function apiErrorFromProblem(
  status: number,
  body: unknown,
  correlationId?: string,
): ApiError {
  const parsed = problemDetailsSchema.safeParse(body);
  const problem = parsed.success ? parsed.data : undefined;

  // The RFC 7807 `type` slug is the most specific signal (e.g. stale-review).
  const byType = problem ? KIND_BY_TYPE[problem.type] : undefined;
  const kind: ApiErrorKind =
    byType ?? KIND_BY_STATUS[status] ?? (status >= 500 ? 'server' : 'unknown');

  return new ApiError(kind, problem?.detail ?? `Request failed with status ${status}.`, {
    status,
    ...(problem ? { problem } : {}),
    correlationId: correlationId ?? problem?.correlationId,
  });
}
