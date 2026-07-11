import Chip from '@mui/material/Chip';
import { SEVERITY_TOKENS } from '@/theme/tokens';
import type { FindingSeverity } from '@/types/domain';

interface SeverityBadgeProps {
  severity: FindingSeverity | 'UNKNOWN';
  size?: 'small' | 'medium';
}

/** Severity indicator combining color + label (never color alone, §10/§19). */
export function SeverityBadge({ severity, size = 'small' }: SeverityBadgeProps) {
  if (severity === 'UNKNOWN') {
    return <Chip label="Unknown" color="default" size={size} variant="outlined" />;
  }
  const token = SEVERITY_TOKENS[severity];
  return (
    <Chip
      label={<span aria-label={`Severity: ${token.label}`}>{token.label}</span>}
      color={token.color}
      size={size}
      sx={{ fontWeight: 700 }}
    />
  );
}
