import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useToast } from '@/components/feedback/ToastProvider';
import { EstimatePanel } from '@/features/review-estimate/EstimatePanel';
import { StartReviewDialog } from '@/features/reviews/StartReviewDialog';
import { useEstimateReview, useStartReview } from '@/features/reviews/hooks';
import { usePullRequest, useRepositories } from '@/features/browse/hooks';
import { paths } from '@/app/paths';
import { formatDateTime } from '@/utils/format';
import { messageForError } from '@/api/errors/messages';
import { trackEvent } from '@/observability/analytics';

/** Step 5–7: PR details, estimate, and explicit review start (§9). */
export function PullRequestDetailPage() {
  const { connectionId = '', projectId = '', repositoryId = '', pullRequestId = '' } = useParams();
  const prId = Number(pullRequestId);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    data: pr,
    isPending,
    isError,
    error,
    refetch,
  } = usePullRequest(connectionId, projectId, repositoryId, prId);
  const repositories = useRepositories(connectionId, projectId);
  const repositoryName =
    repositories.data?.find((r) => r.id === repositoryId)?.name ?? 'Repository';

  const estimate = useEstimateReview();
  const start = useStartReview();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const target = { connectionId, projectId, repositoryId, pullRequestId: prId };

  const runEstimate = () => {
    trackEvent('estimate_requested');
    estimate.mutate(target, { onError: (e) => showToast(messageForError(e), 'error') });
  };

  const confirmStart = () => {
    start.mutate(target, {
      onSuccess: (review) => {
        trackEvent('review_started');
        setConfirmOpen(false);
        navigate(paths.review(review.id));
      },
      onError: (e) => showToast(messageForError(e), 'error'),
    });
  };

  if (isPending) return <LoadingSkeleton variant="detail" aria-label="Loading pull request" />;
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const overLimits = estimate.data ? !estimate.data.withinLimits : false;
  const canStart = Boolean(estimate.data) && !overLimits;

  return (
    <>
      <PageHeader
        title={pr.title}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Connections', to: paths.connections },
              { label: 'Projects', to: paths.projects(connectionId) },
              { label: 'Repositories', to: paths.repositories(connectionId, projectId) },
              {
                label: 'Pull requests',
                to: paths.pullRequests(connectionId, projectId, repositoryId),
              },
              { label: `!${pr.pullRequestId}` },
            ]}
          />
        }
      />

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Card variant="outlined" component="section" aria-label="Pull request details">
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip label={`!${pr.pullRequestId}`} size="small" />
              <Chip label={pr.status} size="small" variant="outlined" />
              {pr.isDraft && <Chip label="Draft" size="small" color="warning" />}
            </Box>

            <MetaRow label="Author" value={pr.author ?? '—'} />
            <MetaRow label="Source branch" value={pr.sourceBranch} mono />
            <MetaRow label="Target branch" value={pr.targetBranch} mono />
            <MetaRow label="Source commit" value={pr.sourceCommitShort ?? '—'} mono />
            <MetaRow label="Target commit" value={pr.targetCommitShort ?? '—'} mono />
            <MetaRow label="Created" value={formatDateTime(pr.createdAt)} />

            {pr.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                {/* Untrusted text: rendered escaped, never as HTML (§5, §11). */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {pr.description}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined" component="section" aria-label="Review estimate">
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h3" component="h2">
                Review estimate
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon />}
                onClick={runEstimate}
                disabled={estimate.isPending}
              >
                {estimate.isPending ? 'Estimating…' : 'Estimate review'}
              </Button>
            </Box>

            {estimate.isPending ? (
              <LoadingSkeleton rows={2} aria-label="Estimating review" />
            ) : estimate.isError ? (
              <ErrorState error={estimate.error} onRetry={runEstimate} />
            ) : estimate.data ? (
              <EstimatePanel estimate={estimate.data} />
            ) : (
              <Alert severity="info">
                Request an estimate to see the size and cost before starting a review. Estimating
                does not start a review.
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={!canStart || start.isPending}
            >
              Start AI review
            </Button>
            {!estimate.data && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Estimate the review first to enable starting.
              </Typography>
            )}
            {overLimits && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                This pull request exceeds the configured limits and cannot be reviewed.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <StartReviewDialog
        open={confirmOpen}
        pending={start.isPending}
        pullRequest={pr}
        repositoryName={repositoryName}
        estimate={estimate.data ?? null}
        onConfirm={confirmStart}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: mono ? 'monospace' : undefined,
          textAlign: 'right',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
