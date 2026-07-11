import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/Cancel';
import { REVIEW_STATUS_DISPLAY } from './reviewStatusDisplay';
import { canCancelReview } from '@/types/domain';
import { formatDateTime, formatElapsed } from '@/utils/format';
import type { ReviewDetailVM } from '@/types/view-models';

interface ReviewProgressProps {
  review: ReviewDetailVM;
  onCancel: () => void;
  cancelPending: boolean;
}

/**
 * Live progress for an active review (§8). Shows the current stage, start time,
 * and a ticking elapsed timer, with an indeterminate bar (the backend does not
 * expose a precise percentage, so none is invented). The stage description sits
 * in an aria-live region so only meaningful transitions are announced — not
 * every poll (§19).
 */
export function ReviewProgress({ review, onCancel, cancelPending }: ReviewProgressProps) {
  const display = REVIEW_STATUS_DISPLAY[review.status];
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: 'grid', gap: 2, maxWidth: 560 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {display.icon}
        <Typography variant="h3" component="h2">
          {display.label}
        </Typography>
      </Box>

      <Typography role="status" aria-live="polite" color="text.secondary">
        {display.description}
      </Typography>

      <LinearProgress aria-label={`Review status: ${display.label}`} />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Started
          </Typography>
          <Typography variant="body2">{formatDateTime(review.createdAt)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Elapsed
          </Typography>
          <Typography variant="body2">{formatElapsed(review.createdAt.getTime(), now)}</Typography>
        </Box>
      </Box>

      {canCancelReview(review.status) && (
        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={cancelPending}
          >
            {cancelPending ? 'Cancelling…' : 'Cancel review'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
