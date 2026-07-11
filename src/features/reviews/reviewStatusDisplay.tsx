import type { ReactElement } from 'react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DownloadingIcon from '@mui/icons-material/Downloading';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import EditNoteIcon from '@mui/icons-material/EditNote';
import type { ReviewStatus } from '@/types/domain';

type ChipColor = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info';

export interface ReviewStatusDisplay {
  label: string;
  description: string;
  color: ChipColor;
  icon: ReactElement;
}

/** Human-facing mapping for each review status (§8 status table). */
export const REVIEW_STATUS_DISPLAY: Record<ReviewStatus, ReviewStatusDisplay> = {
  DRAFT: {
    label: 'Draft',
    description: 'Preparing the review',
    color: 'default',
    icon: <EditNoteIcon fontSize="small" />,
  },
  QUEUED: {
    label: 'Queued',
    description: 'Waiting to start',
    color: 'info',
    icon: <ScheduleIcon fontSize="small" />,
  },
  FETCHING_PR: {
    label: 'Fetching',
    description: 'Retrieving pull-request changes',
    color: 'info',
    icon: <DownloadingIcon fontSize="small" />,
  },
  ANALYZING: {
    label: 'Analyzing',
    description: 'AI review in progress',
    color: 'primary',
    icon: <PsychologyIcon fontSize="small" />,
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Review completed',
    color: 'success',
    icon: <CheckCircleIcon fontSize="small" />,
  },
  FAILED: {
    label: 'Failed',
    description: 'Review failed',
    color: 'error',
    icon: <ErrorIcon fontSize="small" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'Review cancelled',
    color: 'default',
    icon: <CancelIcon fontSize="small" />,
  },
  STALE: {
    label: 'Stale',
    description: 'Pull request changed after the review',
    color: 'warning',
    icon: <HistoryToggleOffIcon fontSize="small" />,
  },
};
