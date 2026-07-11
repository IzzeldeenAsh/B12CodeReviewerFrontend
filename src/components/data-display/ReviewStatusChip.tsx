import { REVIEW_STATUS_DISPLAY } from '@/features/reviews/reviewStatusDisplay';
import type { ReviewStatus } from '@/types/domain';
import { StatusChip } from './StatusChip';

/** Convenience wrapper mapping a ReviewStatus to a labelled, coloured chip. */
export function ReviewStatusChip({ status }: { status: ReviewStatus }) {
  const display = REVIEW_STATUS_DISPLAY[status];
  return (
    <StatusChip
      label={display.label}
      color={display.color}
      icon={display.icon}
      srPrefix="Status: "
    />
  );
}
