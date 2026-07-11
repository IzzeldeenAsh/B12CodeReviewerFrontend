import Chip from '@mui/material/Chip';
import type { ReactElement } from 'react';

type ChipColor = 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info';

interface StatusChipProps {
  label: string;
  color?: ChipColor;
  icon?: ReactElement;
  /** Accessible description prefix, e.g. "Status: ". */
  srPrefix?: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

/**
 * Status pill that always pairs color with a text label and (optionally) an
 * icon, so meaning never depends on color alone (§10, §19).
 */
export function StatusChip({
  label,
  color = 'default',
  icon,
  srPrefix,
  size = 'small',
  variant = 'filled',
}: StatusChipProps) {
  return (
    <Chip
      label={srPrefix ? <span aria-label={`${srPrefix}${label}`}>{label}</span> : label}
      color={color}
      icon={icon}
      size={size}
      variant={variant}
      sx={{ fontWeight: 600 }}
    />
  );
}
