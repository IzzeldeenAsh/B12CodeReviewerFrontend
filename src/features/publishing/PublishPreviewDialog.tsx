import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import type { SelectionSummary } from '@/features/review-findings/selection';

interface PublishPreviewDialogProps {
  open: boolean;
  pending: boolean;
  publishSummary: boolean;
  summaryText: string | null;
  selection: SelectionSummary;
  pullRequestId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Publish preview + explicit confirmation (§11). Shows exactly what will be
 * posted to Azure DevOps before the single, deliberate publish action. The
 * publish endpoint is only ever called from the confirm button here — never on
 * checkbox change, page load, or review completion.
 */
export function PublishPreviewDialog({
  open,
  pending,
  publishSummary,
  summaryText,
  selection,
  pullRequestId,
  onConfirm,
  onCancel,
}: PublishPreviewDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Publish comments to Azure DevOps?"
      confirmLabel="Publish selected comments"
      cancelLabel="Cancel"
      confirmColor="primary"
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <Typography variant="body2">
          The following will be posted to pull request <strong>!{pullRequestId}</strong>:
        </Typography>

        <Box>
          <Typography variant="subtitle2">Summary comment</Typography>
          {publishSummary ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: 'pre-wrap',
                maxHeight: 160,
                overflow: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                mt: 0.5,
              }}
            >
              {summaryText ?? 'No summary text available.'}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not included.
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle2">Findings ({selection.total})</Typography>
          <Typography variant="body2" color="text.secondary">
            {selection.inline} inline comment(s), {selection.general} general comment(s).
          </Typography>
          {selection.downgradedToGeneral > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              {selection.downgradedToGeneral} finding(s) reference a position that is no longer
              valid and will be posted as general comments instead of inline.
            </Alert>
          )}
        </Box>

        <Alert severity="info">
          This posts comments to Azure DevOps. It does not approve, reject, vote on, or complete the
          pull request. Already-published findings are skipped automatically.
        </Alert>
      </Box>
    </ConfirmationDialog>
  );
}
