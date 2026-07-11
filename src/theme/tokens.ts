import type { FindingSeverity, Recommendation } from '@/types/domain';

/**
 * Semantic design tokens (§12). Components must reference these — never hard-code
 * hex values. Each token carries a color role AND a non-color signal (icon name
 * / label) because status must never rely on color alone (§10, §19).
 */

export interface SeverityToken {
  label: string;
  /** MUI palette channel used for chips/badges. */
  color: 'error' | 'warning' | 'info' | 'default';
  /** Ordinal for sorting; higher = more severe. */
  weight: number;
}

export const SEVERITY_TOKENS: Record<FindingSeverity, SeverityToken> = {
  BLOCKER: { label: 'Blocker', color: 'error', weight: 3 },
  HIGH: { label: 'High', color: 'error', weight: 2 },
  MEDIUM: { label: 'Medium', color: 'warning', weight: 1 },
  LOW: { label: 'Low', color: 'info', weight: 0 },
};

export interface RecommendationToken {
  /** Short user-facing label. */
  label: string;
  /** One-line explanation shown under the heading. */
  headline: string;
  color: 'success' | 'error' | 'warning';
  /** MUI Alert severity used for the accessible status region. */
  severity: 'success' | 'error' | 'warning';
}

export const RECOMMENDATION_TOKENS: Record<Recommendation, RecommendationToken> = {
  APPROVE: {
    label: 'Approve',
    headline: 'No blocking issues found',
    color: 'success',
    severity: 'success',
  },
  REQUEST_CHANGES: {
    label: 'Request changes',
    headline: 'Important issues should be addressed',
    color: 'error',
    severity: 'error',
  },
  HUMAN_REVIEW: {
    label: 'Human review',
    headline: 'The AI could not reach a reliable conclusion',
    color: 'warning',
    severity: 'warning',
  },
};

/** Advisory disclaimer shown wherever a recommendation appears (§10). */
export const AI_DISCLAIMER =
  'This is an AI-generated recommendation. A human reviewer makes the final decision.';
