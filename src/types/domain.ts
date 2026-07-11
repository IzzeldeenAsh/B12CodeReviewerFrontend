/**
 * Frontend domain constants. These MIRROR the backend enums (kept in sync by
 * `/api-contract-check`). They are the single source of truth for ordering,
 * labels, and exhaustive UI switches. Presentation view models live in
 * `src/types/view-models.ts`; raw wire shapes live in `src/api/contracts`.
 */

export const REVIEW_STATUSES = [
  'DRAFT',
  'QUEUED',
  'FETCHING_PR',
  'ANALYZING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'STALE',
] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** States that still change and therefore warrant polling. */
export const ACTIVE_REVIEW_STATUSES: readonly ReviewStatus[] = [
  'DRAFT',
  'QUEUED',
  'FETCHING_PR',
  'ANALYZING',
];

/** States that are final; polling stops here. */
export const TERMINAL_REVIEW_STATUSES: readonly ReviewStatus[] = [
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'STALE',
];

export function isActiveReviewStatus(status: ReviewStatus): boolean {
  return ACTIVE_REVIEW_STATUSES.includes(status);
}

export function isTerminalReviewStatus(status: ReviewStatus): boolean {
  return TERMINAL_REVIEW_STATUSES.includes(status);
}

/** A review may be cancelled only while it is active. */
export function canCancelReview(status: ReviewStatus): boolean {
  return isActiveReviewStatus(status);
}

export const RECOMMENDATIONS = ['APPROVE', 'REQUEST_CHANGES', 'HUMAN_REVIEW'] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export const FINDING_SEVERITIES = ['BLOCKER', 'HIGH', 'MEDIUM', 'LOW'] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

/** Descending severity weight — higher sorts first. */
export const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  BLOCKER: 3,
  HIGH: 2,
  MEDIUM: 1,
  LOW: 0,
};

export function compareSeverity(a: FindingSeverity, b: FindingSeverity): number {
  return SEVERITY_ORDER[b] - SEVERITY_ORDER[a];
}

export const FINDING_CATEGORIES = [
  'BUG',
  'SECURITY',
  'RELIABILITY',
  'PERFORMANCE',
  'MAINTAINABILITY',
  'TESTING',
] as const;
export type FindingCategory = (typeof FINDING_CATEGORIES)[number];

export const FINDING_PUBLISH_STATES = ['UNPUBLISHED', 'PUBLISHED'] as const;
export type FindingPublishState = (typeof FINDING_PUBLISH_STATES)[number];

export const CREDENTIAL_TYPES = ['PAT_ENV', 'PAT_KEY_VAULT', 'ENTRA_CLIENT_CREDENTIALS'] as const;
export type CredentialType = (typeof CREDENTIAL_TYPES)[number];
