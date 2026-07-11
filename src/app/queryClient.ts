import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/errors/api-error';

/**
 * Shared TanStack Query client (§16).
 *
 * Retry policy is deliberately conservative: only transient read failures
 * (network / 429 / 503) are retried, and only a couple of times. Mutations are
 * NEVER retried automatically — publishing and starting reviews must not be
 * silently repeated. Expensive endpoints (estimate) are configured per-hook.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            return error.isRetryable && failureCount < 2;
          }
          return false;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        retry: false,
      },
    },
  });
}
