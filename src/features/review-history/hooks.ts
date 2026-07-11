import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as api from '@/api/client/endpoints';
import { queryKeys } from '@/api/query-keys';
import { toReviewSummaryVM } from '@/api/mappers';
import type { ReviewSummaryVM } from '@/types/view-models';

export interface ReviewHistoryFilters {
  page: number;
  pageSize: number;
  status?: string;
}

export interface ReviewHistoryResult {
  items: ReviewSummaryVM[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

/** Paginated review history (§17). Keeps previous page visible while fetching. */
export function useReviewHistory(filters: ReviewHistoryFilters) {
  return useQuery({
    queryKey: queryKeys.reviewHistory(filters),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }): Promise<ReviewHistoryResult> => {
      const wire = await api.listReviews(filters, signal);
      return {
        items: wire.items.map(toReviewSummaryVM),
        page: wire.page,
        pageSize: wire.pageSize,
        total: wire.total,
        hasNextPage: wire.hasNextPage,
      };
    },
  });
}
