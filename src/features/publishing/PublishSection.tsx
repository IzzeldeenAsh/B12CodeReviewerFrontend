import { useEffect, useMemo, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import PublishIcon from '@mui/icons-material/Publish';
import { messageForError } from '@/api/errors/messages';
import { trackEvent } from '@/observability/analytics';
import {
  buildPublishPayload,
  canPublish,
  summarizeSelection,
} from '@/features/review-findings/selection';
import type { PublishReviewRequest } from '@/api/contracts/requests';
import type { FindingVM, PublishResultVM } from '@/types/view-models';
import { PublishPreviewDialog } from './PublishPreviewDialog';

interface PublishSectionProps {
  pullRequestId: number;
  summaryText: string | null;
  findings: FindingVM[];
  selectedIds: Set<string>;
  /** True when the review is stale — publishing is blocked entirely (§12). */
  disabled: boolean;
  pending: boolean;
  result: PublishResultVM | undefined;
  error: unknown;
  onPublish: (payload: PublishReviewRequest) => void;
}

/**
 * Manual publishing controls (§11–§12). Publishing requires an explicit choice
 * of what to include, a preview, and a confirmation. On success or failure,
 * focus moves to the result alert (§19).
 */
export function PublishSection({
  pullRequestId,
  summaryText,
  findings,
  selectedIds,
  disabled,
  pending,
  result,
  error,
  onPublish,
}: PublishSectionProps) {
  const [publishSummary, setPublishSummary] = useState(false);
  const [includeFindings, setIncludeFindings] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const effectiveSelected = useMemo(
    () => (includeFindings ? selectedIds : new Set<string>()),
    [includeFindings, selectedIds],
  );
  const selection = useMemo(
    () => summarizeSelection(findings, effectiveSelected),
    [findings, effectiveSelected],
  );

  const payload = buildPublishPayload(publishSummary, findings, effectiveSelected);
  const ready = canPublish(payload) && !disabled;

  // Move focus to the result alert after a publish attempt resolves (§19).
  useEffect(() => {
    if (result || error) resultRef.current?.focus();
  }, [result, error]);

  const openPreview = () => {
    trackEvent('publish_preview_opened');
    setPreviewOpen(true);
  };

  const confirmPublish = () => {
    onPublish(payload);
    setPreviewOpen(false);
  };

  return (
    <Box component="section" aria-label="Publish comments">
      <Typography variant="h3" component="h2" gutterBottom>
        Publish comments
      </Typography>

      {disabled ? (
        <Alert severity="warning">
          Publishing is unavailable because this review is no longer in a publishable state.
        </Alert>
      ) : (
        <>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={publishSummary}
                  onChange={(e) => setPublishSummary(e.target.checked)}
                />
              }
              label="Publish review summary"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeFindings}
                  onChange={(e) => setIncludeFindings(e.target.checked)}
                />
              }
              label={`Publish selected findings (${selectedIds.size} selected)`}
            />
          </FormGroup>

          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={openPreview}
            disabled={!ready || pending}
            sx={{ mt: 1 }}
          >
            Preview and publish
          </Button>
          {!ready && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Choose the summary and/or at least one selected finding to publish.
            </Typography>
          )}
        </>
      )}

      <Box ref={resultRef} tabIndex={-1} sx={{ mt: 2, outline: 'none' }}>
        {result && (
          <Alert severity="success">
            <AlertTitle>Comments published</AlertTitle>
            {result.publishedSummary && 'Summary published. '}
            {result.publishedFindingIds.length} finding(s) published.
            {result.skippedAlreadyPublished.length > 0 &&
              ` ${result.skippedAlreadyPublished.length} already-published finding(s) were skipped.`}
          </Alert>
        )}
        {error != null && (
          <Alert severity="error">
            <AlertTitle>Publishing failed</AlertTitle>
            {messageForError(error)}
          </Alert>
        )}
      </Box>

      <PublishPreviewDialog
        open={previewOpen}
        pending={pending}
        publishSummary={publishSummary}
        summaryText={summaryText}
        selection={selection}
        pullRequestId={pullRequestId}
        onConfirm={confirmPublish}
        onCancel={() => setPreviewOpen(false)}
      />
    </Box>
  );
}
