import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import { AI_DISCLAIMER, RECOMMENDATION_TOKENS } from '@/theme/tokens';
import { formatConfidence } from '@/utils/format';
import type { Recommendation } from '@/types/domain';

interface RecommendationPanelProps {
  finalRecommendation: Recommendation;
  /** Shown as secondary info when the backend exposes the model's own view. */
  modelRecommendation?: Recommendation | null;
  confidence?: number | null;
}

const ICONS: Record<Recommendation, React.ReactElement> = {
  APPROVE: <CheckCircleIcon fontSize="inherit" />,
  REQUEST_CHANGES: <ReportProblemIcon fontSize="inherit" />,
  HUMAN_REVIEW: <HelpCenterIcon fontSize="inherit" />,
};

/**
 * Reusable recommendation panel (§10). Distinguishes the three outcomes with an
 * icon, heading, and label — never color alone — and ALWAYS shows the advisory
 * disclaimer that a human makes the final decision. There is deliberately no
 * approve/reject/merge control anywhere in this component.
 */
export function RecommendationPanel({
  finalRecommendation,
  modelRecommendation,
  confidence,
}: RecommendationPanelProps) {
  const token = RECOMMENDATION_TOKENS[finalRecommendation];
  const showModel = modelRecommendation && modelRecommendation !== finalRecommendation;

  return (
    <Box>
      <Alert
        severity={token.severity}
        icon={ICONS[finalRecommendation]}
        variant="outlined"
        role="status"
      >
        <AlertTitle sx={{ fontWeight: 700 }}>{token.label}</AlertTitle>
        <Typography variant="body2">{token.headline}</Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {confidence !== null && confidence !== undefined && (
            <Typography variant="caption" color="text.secondary">
              Confidence: {formatConfidence(confidence)}
            </Typography>
          )}
          {showModel && (
            <Typography variant="caption" color="text.secondary">
              Model’s own recommendation: {RECOMMENDATION_TOKENS[modelRecommendation].label}
            </Typography>
          )}
        </Box>
      </Alert>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
      >
        {AI_DISCLAIMER}
      </Typography>
    </Box>
  );
}
