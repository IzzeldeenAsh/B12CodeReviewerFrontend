import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { formatCost, formatInteger } from '@/utils/format';
import type { EstimateVM, PullRequestVM } from '@/types/view-models';

interface StartReviewDialogProps {
  open: boolean;
  pending: boolean;
  pullRequest: PullRequestVM;
  repositoryName: string;
  estimate: EstimateVM | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation before starting an AI review (§7). Restates the target, size,
 * cost, and expected skips, and makes explicit that the review is advisory and
 * that nothing is published automatically. Labels are unambiguous.
 */
export function StartReviewDialog({
  open,
  pending,
  pullRequest,
  repositoryName,
  estimate,
  onConfirm,
  onCancel,
}: StartReviewDialogProps) {
  return (
    <ConfirmationDialog
      open={open}
      title="Start AI review?"
      confirmLabel="Start AI review"
      cancelLabel="Cancel"
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography variant="body2">
          <strong>
            !{pullRequest.pullRequestId} {pullRequest.title}
          </strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {repositoryName} · {pullRequest.sourceBranch} → {pullRequest.targetBranch}
        </Typography>

        {estimate && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">
              Estimated size: {formatInteger(estimate.fileCount)} files,{' '}
              {formatInteger(estimate.changedLines)} changed lines
            </Typography>
            <Typography variant="body2">
              Estimated cost: {formatCost(estimate.estimatedCost)}
            </Typography>
            {estimate.skippedFiles.length > 0 && (
              <Typography variant="body2">
                {formatInteger(estimate.skippedFiles.length)} file(s) will be skipped.
              </Typography>
            )}
          </Box>
        )}

        <Alert severity="info" sx={{ mt: 1 }}>
          The review is advisory. The AI recommends; you decide. No comments are published to Azure
          DevOps automatically — publishing is a separate, explicit step.
        </Alert>
      </Box>
    </ConfirmationDialog>
  );
}
