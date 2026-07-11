import { describe, expect, it } from 'vitest';
import { ApiError, apiErrorFromProblem } from './api-error';
import { messageForError } from './messages';

describe('apiErrorFromProblem', () => {
  it('maps the stale-review type to the stale kind', () => {
    const err = apiErrorFromProblem(409, {
      type: 'stale-review',
      title: 'Stale',
      status: 409,
      detail: 'PR changed',
    });
    expect(err.kind).toBe('stale');
    expect(messageForError(err)).toMatch(/changed after the review/i);
  });

  it('maps status codes to kinds', () => {
    expect(apiErrorFromProblem(401, {}).kind).toBe('unauthenticated');
    expect(apiErrorFromProblem(403, {}).kind).toBe('forbidden');
    expect(apiErrorFromProblem(413, {}).kind).toBe('limitExceeded');
    expect(apiErrorFromProblem(422, {}).kind).toBe('unprocessable');
    expect(apiErrorFromProblem(429, {}).kind).toBe('rateLimited');
    expect(apiErrorFromProblem(503, {}).kind).toBe('upstreamUnavailable');
    expect(apiErrorFromProblem(500, {}).kind).toBe('server');
  });

  it('marks only transient failures retryable', () => {
    expect(apiErrorFromProblem(429, {}).isRetryable).toBe(true);
    expect(apiErrorFromProblem(503, {}).isRetryable).toBe(true);
    expect(apiErrorFromProblem(400, {}).isRetryable).toBe(false);
    expect(ApiError.network().isRetryable).toBe(true);
    expect(ApiError.aborted().isRetryable).toBe(false);
  });

  it('never leaks raw detail through user-facing messages', () => {
    const err = apiErrorFromProblem(500, {
      type: 'about:blank',
      title: 'x',
      status: 500,
      detail: 'SECRET stack trace token=abc',
    });
    expect(messageForError(err)).not.toContain('SECRET');
  });
});
