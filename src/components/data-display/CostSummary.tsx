import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface CostMetric {
  label: string;
  value: string;
  /** Optional emphasis for the primary metric. */
  emphasize?: boolean;
}

/**
 * Compact metric grid for cost/size summaries (§6, §9). Presentational only —
 * values are pre-formatted by the caller.
 */
export function CostSummary({ metrics }: { metrics: CostMetric[] }) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {metrics.map((metric) => (
        <Box key={metric.label}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {metric.label}
          </Typography>
          <Typography
            component="dd"
            variant={metric.emphasize ? 'h3' : 'body1'}
            sx={{ m: 0, fontWeight: metric.emphasize ? 700 : 600 }}
          >
            {metric.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
