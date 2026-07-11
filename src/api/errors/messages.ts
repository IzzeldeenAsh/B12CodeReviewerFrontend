import { ApiError, type ApiErrorKind } from './api-error';

/**
 * Central, user-safe copy for every failure. Never render `error.message`
 * (backend detail) directly in the UI — it may echo untrusted or sensitive
 * content. Route everything through here so wording stays consistent and safe.
 */
const MESSAGES: Record<ApiErrorKind, string> = {
  validation: 'Some of the information provided is invalid. Please review and try again.',
  unauthenticated: 'Your session has expired. Sign in again to continue.',
  forbidden: 'You do not have permission to access this resource.',
  notFound: 'We could not find what you were looking for.',
  conflict: 'This action conflicts with the current state. Refresh and try again.',
  stale:
    'This pull request changed after the review was created. Start a new review before publishing comments.',
  duplicate: 'This action has already been performed.',
  limitExceeded: 'This pull request exceeds the configured review limits.',
  unprocessable:
    'The selected items cannot be published as requested. Adjust your selection and try again.',
  rateLimited: 'The service is temporarily rate-limited. Try again shortly.',
  upstreamFailure: 'The review provider is temporarily unavailable.',
  upstreamUnavailable: 'The review provider is temporarily unavailable.',
  server: 'Something went wrong on our side. Please try again.',
  network: 'Could not reach the server. Check your connection and try again.',
  aborted: 'The request was cancelled.',
  parse: 'The server returned an unexpected response.',
  unknown: 'Something went wrong. Please try again.',
};

export function messageForError(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.kind];
  }
  return MESSAGES.unknown;
}

/** A short, stable title for an error surface (used by ErrorState headings). */
export function titleForError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'unauthenticated':
        return 'Session expired';
      case 'forbidden':
        return 'Access denied';
      case 'notFound':
        return 'Not found';
      case 'stale':
        return 'Review is out of date';
      case 'limitExceeded':
        return 'Pull request too large';
      case 'rateLimited':
        return 'Slow down';
      case 'network':
        return 'Connection problem';
      default:
        return 'Something went wrong';
    }
  }
  return 'Something went wrong';
}
