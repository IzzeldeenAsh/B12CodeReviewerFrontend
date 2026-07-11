import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { CostSummary } from '@/components/data-display/CostSummary';
import { SkippedFileTable } from '@/components/data-display/SkippedFileTable';
import { formatCost, formatInteger } from '@/utils/format';
import type { EstimateVM } from '@/types/view-models';

/**
 * Presentational estimate results (§6). Shows size/cost, skipped files, and
 * warnings. Displaying an estimate NEVER starts a review. When the PR exceeds
 * limits, the parent disables the start action and this panel explains why.
 */
export function EstimatePanel({ estimate }: { estimate: EstimateVM }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <CostSummary
        metrics={[
          { label: 'Files', value: formatInteger(estimate.fileCount) },
          { label: 'Changed lines', value: formatInteger(estimate.changedLines) },
          { label: 'Est. input tokens', value: formatInteger(estimate.estimatedInputTokens) },
          { label: 'Est. cost', value: formatCost(estimate.estimatedCost), emphasize: true },
          { label: 'Skipped files', value: formatInteger(estimate.skippedFiles.length) },
        ]}
      />

      {!estimate.withinLimits && (
        <Alert severity="error">
          This pull request exceeds the configured review limits and cannot be reviewed as-is.
          Reduce the number of changed files or lines, or split the pull request, then estimate
          again.
        </Alert>
      )}

      {estimate.warnings.length > 0 && (
        <Alert severity="warning">
          <Typography variant="body2" component="div">
            The review may be partial:
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {estimate.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </Box>
          </Typography>
        </Alert>
      )}

      {estimate.skippedFiles.length > 0 && (
        <Box>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="subtitle2" gutterBottom>
            Skipped files
          </Typography>
          <SkippedFileTable files={estimate.skippedFiles} />
        </Box>
      )}
    </Box>
  );
}
