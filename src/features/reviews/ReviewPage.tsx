import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ReviewStatusChip } from '@/components/data-display/ReviewStatusChip';
import { useToast } from '@/components/feedback/ToastProvider';
import { FindingsSection } from '@/features/review-findings/FindingsSection';
import { publishableFindings } from '@/features/review-findings/selection';
import { PublishSection } from '@/features/publishing/PublishSection';
import { isActiveReviewStatus } from '@/types/domain';
import { paths } from '@/app/paths';
import { messageForError } from '@/api/errors/messages';
import { trackEvent, type AnalyticsEvent } from '@/observability/analytics';
import type { ReviewStatus } from '@/types/domain';
import { useCancelReview, usePublishReview, useReview } from './hooks';
import { ReviewProgress } from './ReviewProgress';
import { ReviewResults } from './ReviewResults';

const TERMINAL_EVENT: Partial<Record<ReviewStatus, AnalyticsEvent>> = {
  COMPLETED: 'review_completed',
  FAILED: 'review_failed',
  CANCELLED: 'review_cancelled',
  STALE: 'review_stale',
};

/** Steps 8–12: track progress, read results, select findings, publish (§9). */
export function ReviewPage() {
  const { reviewId = '' } = useParams();
  const location = useLocation();
  const { showToast } = useToast();
  const connectionId = (location.state as { connectionId?: string } | null)?.connectionId;

  const { data: review, isPending, isError, error, refetch } = useReview(reviewId);
  const cancel = useCancelReview(reviewId);
  const publish = usePublishReview(reviewId);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Announce/track terminal transitions exactly once.
  const previousStatus = useRef<ReviewStatus | null>(null);
  useEffect(() => {
    if (!review) return;
    if (previousStatus.current && previousStatus.current !== review.status) {
      const event = TERMINAL_EVENT[review.status];
      if (event) trackEvent(event);
    }
    previousStatus.current = review.status;
  }, [review]);

  const findings = useMemo(() => review?.findings ?? [], [review]);
  const publishable = useMemo(() => publishableFindings(findings), [findings]);

  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const selectAll = () => setSelectedIds(new Set(publishable.map((f) => f.id)));
  const clear = () => setSelectedIds(new Set());

  if (isPending) return <LoadingSkeleton variant="detail" aria-label="Loading review" />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const isActive = isActiveReviewStatus(review.status);
  const isStale = review.status === 'STALE';
  const isCompleted = review.status === 'COMPLETED';

  const backToPr =
    connectionId && review
      ? paths.pullRequest(connectionId, review.projectId, review.repositoryId, review.pullRequestId)
      : null;

  return (
    <>
      <PageHeader
        title={`Review of !${review.pullRequestId}`}
        actions={<ReviewStatusChip status={review.status} />}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Review history', to: paths.reviews },
              { label: `Review !${review.pullRequestId}` },
            ]}
          />
        }
      />

      {isActive && (
        <ReviewProgress
          review={review}
          cancelPending={cancel.isPending}
          onCancel={() =>
            cancel.mutate(undefined, {
              onError: (e) => showToast(messageForError(e), 'error'),
            })
          }
        />
      )}

      {review.status === 'FAILED' && (
        <Alert severity="error">
          <AlertTitle>Review failed</AlertTitle>
          The review could not be completed. You can start a new review from the pull request.
          {backToPr && (
            <Box sx={{ mt: 1 }}>
              <Button
                component={RouterLink}
                to={backToPr}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Back to pull request
              </Button>
            </Box>
          )}
        </Alert>
      )}

      {review.status === 'CANCELLED' && (
        <Alert severity="info">
          <AlertTitle>Review cancelled</AlertTitle>
          This review was cancelled. No comments were published.
        </Alert>
      )}

      {isStale && (
        <Alert severity="warning">
          <AlertTitle>Pull request changed after this review</AlertTitle>
          This pull request changed after the review was created, so publishing is disabled. Start a
          new review before publishing comments.
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {backToPr ? (
              <Button
                component={RouterLink}
                to={backToPr}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Back to pull request
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to={paths.connections}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Back to connections
              </Button>
            )}
          </Box>
        </Alert>
      )}

      {(isCompleted || isStale) && review.finalRecommendation !== null && (
        <Box sx={{ mt: 3, display: 'grid', gap: 3 }}>
          <ReviewResults review={review} />

          <Divider />

          <Box component="section" aria-label="Findings">
            <FindingsSection
              findings={findings}
              selectedIds={selectedIds}
              onToggle={toggle}
              onSelectAllPublishable={selectAll}
              onClearSelection={clear}
            />
          </Box>

          <Divider />

          <PublishSection
            pullRequestId={review.pullRequestId}
            summaryText={review.summary}
            findings={findings}
            selectedIds={selectedIds}
            disabled={isStale}
            pending={publish.isPending}
            result={publish.data}
            error={publish.error}
            onPublish={(payload) =>
              publish.mutate(payload, {
                onSuccess: (result) => {
                  trackEvent('comments_published', {
                    findingCount: result.publishedFindingIds.length,
                    summary: result.publishedSummary,
                  });
                  clear();
                },
                onError: () => trackEvent('publish_failed'),
              })
            }
          />
        </Box>
      )}
    </>
  );
}
