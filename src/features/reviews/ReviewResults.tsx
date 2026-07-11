import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { RecommendationPanel } from '@/components/data-display/RecommendationPanel';
import { CostSummary } from '@/components/data-display/CostSummary';
import { formatCost, formatInteger } from '@/utils/format';
import type { ReviewDetailVM } from '@/types/view-models';

/**
 * Completed-review header: recommendation, summary, and run metrics (§9).
 * Prompts, raw model text, and tokens beyond counts are never shown.
 */
export function ReviewResults({ review }: { review: ReviewDetailVM }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {review.partial && (
        <Alert severity="warning">
          This is a partial review — some files were skipped or truncated. Treat the results as
          incomplete.
        </Alert>
      )}

      {review.finalRecommendation && (
        <RecommendationPanel
          finalRecommendation={review.finalRecommendation}
          modelRecommendation={review.modelRecommendation}
          confidence={review.confidence}
        />
      )}

      {review.summary && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h3" component="h2" gutterBottom>
              Summary
            </Typography>
            {/* AI-generated untrusted text — rendered escaped, never as HTML (§11). */}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {review.summary}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Review details
          </Typography>
          <CostSummary
            metrics={[
              { label: 'Findings', value: formatInteger(review.findings.length) },
              { label: 'Model', value: review.model ?? '—' },
              { label: 'Input tokens', value: formatInteger(review.inputTokens) },
              { label: 'Output tokens', value: formatInteger(review.outputTokens) },
              { label: 'Est. cost', value: formatCost(review.estimatedCost) },
            ]}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
