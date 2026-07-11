import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface LoadingSkeletonProps {
  /** Number of skeleton rows to render. */
  rows?: number;
  variant?: 'list' | 'cards' | 'detail';
  'aria-label'?: string;
}

/**
 * Loading placeholder (§9). Announces a polite busy status for screen readers
 * while visually presenting shimmer rows.
 */
export function LoadingSkeleton({
  rows = 4,
  variant = 'list',
  'aria-label': ariaLabel = 'Loading',
}: LoadingSkeletonProps) {
  const height = variant === 'detail' ? 120 : variant === 'cards' ? 88 : 52;
  return (
    <Box role="status" aria-live="polite" aria-label={ariaLabel} sx={{ display: 'grid', gap: 1.5 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={height} animation="wave" />
      ))}
    </Box>
  );
}
