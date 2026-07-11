/** Pure formatting helpers. No React, no side effects — fully unit-tested. */

/** refs/heads/feature/x -> feature/x; leaves already-short names untouched. */
export function shortBranchName(ref: string): string {
  return ref.replace(/^refs\/heads\//, '').replace(/^refs\//, '');
}

/** Abbreviate a git commit sha to 8 chars. */
export function shortCommit(commitId: string | undefined | null, length = 8): string | undefined {
  if (!commitId) return undefined;
  return commitId.slice(0, length);
}

/** Parse an ISO date string to a Date, or undefined when absent/invalid. */
export function parseDate(value: string | undefined | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTime(date: Date | undefined | null): string {
  if (!date) return '—';
  return dateTimeFormatter.format(date);
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function formatDate(date: Date | undefined | null): string {
  if (!date) return '—';
  return dateFormatter.format(date);
}

/** Format a USD cost estimate. Null means the backend could not price it. */
export function formatCost(cost: number | null | undefined): string {
  if (cost === null || cost === undefined) return 'Not available';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(cost);
}

/** Compact integer formatting, e.g. 12,345 or 1.2M for token counts. */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat(undefined).format(value);
}

/** 0..1 -> "85%". */
export function formatConfidence(confidence: number | null | undefined): string {
  if (confidence === null || confidence === undefined) return '—';
  return `${Math.round(confidence * 100)}%`;
}

/** Human elapsed duration between two instants, e.g. "1m 20s". */
export function formatElapsed(fromMs: number, toMs: number): string {
  const totalSeconds = Math.max(0, Math.floor((toMs - fromMs) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
