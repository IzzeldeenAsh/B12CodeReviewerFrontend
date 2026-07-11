import {
  CREDENTIAL_TYPES,
  FINDING_CATEGORIES,
  FINDING_PUBLISH_STATES,
  FINDING_SEVERITIES,
  RECOMMENDATIONS,
  REVIEW_STATUSES,
  type CredentialType,
  type FindingCategory,
  type FindingPublishState,
  type FindingSeverity,
  type Recommendation,
  type ReviewStatus,
} from '@/types/domain';

/** Narrow an arbitrary backend string to a known union, or a fallback. */
function narrow<T extends string>(values: readonly T[], raw: string, fallback: T): T {
  return (values as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

export function toReviewStatus(raw: string): ReviewStatus {
  // FAILED is the safest fallback for an unknown terminal-looking status.
  return narrow(REVIEW_STATUSES, raw, 'FAILED');
}

export function toRecommendation(raw: string | null): Recommendation | null {
  if (raw === null) return null;
  return (RECOMMENDATIONS as readonly string[]).includes(raw) ? (raw as Recommendation) : null;
}

export function toSeverity(raw: string): FindingSeverity | 'UNKNOWN' {
  return narrow([...FINDING_SEVERITIES, 'UNKNOWN'] as const, raw, 'UNKNOWN');
}

export function toCategory(raw: string): FindingCategory | 'UNKNOWN' {
  return narrow([...FINDING_CATEGORIES, 'UNKNOWN'] as const, raw, 'UNKNOWN');
}

export function toPublishState(raw: string): FindingPublishState {
  return narrow(FINDING_PUBLISH_STATES, raw, 'UNPUBLISHED');
}

export function toCredentialType(raw: string): CredentialType | 'UNKNOWN' {
  return narrow([...CREDENTIAL_TYPES, 'UNKNOWN'] as const, raw, 'UNKNOWN');
}
