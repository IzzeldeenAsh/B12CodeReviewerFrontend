import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/client/endpoints';
import { queryKeys } from '@/api/query-keys';
import {
  toEstimateVM,
  toPublishResultVM,
  toReviewDetailVM,
  toReviewSummaryVM,
} from '@/api/mappers';
import { isActiveReviewStatus } from '@/types/domain';
import type {
  EstimateReviewRequest,
  PublishReviewRequest,
  StartReviewRequest,
} from '@/api/contracts/requests';
import type { EstimateVM, ReviewDetailVM, ReviewSummaryVM } from '@/types/view-models';

/** How often to poll an active review. Bounded; stops at terminal states (§8). */
const POLL_INTERVAL_MS = 2500;

/**
 * Request a size/cost estimate (§6). This is a MUTATION, not a query: it is
 * user-triggered only and never refetched automatically, so it can never incur
 * backend cost on its own. It does NOT start a review.
 */
export function useEstimateReview() {
  return useMutation({
    mutationFn: async (input: EstimateReviewRequest): Promise<EstimateVM> => {
      const wire = await api.estimateReview(input);
      return toEstimateVM(wire);
    },
  });
}

/** Start a review (§7). Explicit, manual, never retried automatically. */
export function useStartReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: StartReviewRequest): Promise<ReviewSummaryVM> => {
      const wire = await api.startReview(input);
      return toReviewSummaryVM(wire);
    },
    onSuccess: (review) => {
      client.setQueryData(queryKeys.review(review.id), undefined);
    },
  });
}

/**
 * Fetch a review, polling only while it is in an active state (§8, §16).
 * Polling stops for COMPLETED/FAILED/CANCELLED/STALE and does not run while the
 * tab is hidden (TanStack default: refetchInterval pauses in background).
 */
export function useReview(reviewId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.review(reviewId),
    enabled: enabled && reviewId.length > 0,
    queryFn: async ({ signal }): Promise<ReviewDetailVM> => {
      const wire = await api.getReview(reviewId, signal);
      return toReviewDetailVM(wire);
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isActiveReviewStatus(status) ? POLL_INTERVAL_MS : false;
    },
  });
}

/** Cancel an in-progress review (§8). */
export function useCancelReview(reviewId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.cancelReview(reviewId),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.review(reviewId) }),
  });
}

/**
 * Publish selected findings and/or the summary (§12). NEVER retried
 * automatically. A 409 stale error is surfaced to the UI, which disables
 * publishing rather than retrying.
 */
export function usePublishReview(reviewId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: PublishReviewRequest) => {
      const wire = await api.publishReview(reviewId, input);
      return toPublishResultVM(wire);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.review(reviewId) }),
  });
}
