import type {
  CredentialType,
  FindingCategory,
  FindingPublishState,
  FindingSeverity,
  Recommendation,
  ReviewStatus,
} from './domain';

/**
 * Stable presentation view models. Components consume ONLY these — never raw
 * wire DTOs (§8). Enums are narrowed from strings here with safe fallbacks so
 * an unexpected backend value degrades to a neutral display instead of a crash.
 */

export interface ConnectionVM {
  id: string;
  name: string;
  organization: string;
  baseUrl: string;
  credentialType: CredentialType | 'UNKNOWN';
  credentialRef: string;
  createdAt: Date;
}

export interface ProjectVM {
  id: string;
  name: string;
  description?: string;
}

export interface RepositoryVM {
  id: string;
  name: string;
  projectId: string;
  defaultBranch?: string;
  isDisabled: boolean;
}

export interface PullRequestVM {
  pullRequestId: number;
  title: string;
  description?: string;
  status: string;
  /** refs/heads/foo -> foo */
  sourceBranch: string;
  targetBranch: string;
  author?: string;
  sourceCommitShort?: string;
  targetCommitShort?: string;
  createdAt?: Date;
  isDraft: boolean;
}

export interface SkippedFileVM {
  path: string;
  reason: string;
}

export interface EstimateVM {
  fileCount: number;
  changedLines: number;
  estimatedInputTokens: number;
  estimatedCost: number | null;
  skippedFiles: SkippedFileVM[];
  withinLimits: boolean;
  warnings: string[];
}

export interface FindingVM {
  id: string;
  severity: FindingSeverity | 'UNKNOWN';
  category: FindingCategory | 'UNKNOWN';
  filePath: string | null;
  lineNumber: number | null;
  title: string;
  explanation: string;
  evidence: string;
  suggestedFix: string | null;
  confidence: number;
  /** True when the finding can be posted inline at a valid position. */
  isInline: boolean;
  publishState: FindingPublishState;
  isPublished: boolean;
}

export interface ReviewSummaryVM {
  id: string;
  status: ReviewStatus;
  pullRequestId: number;
  projectId: string;
  repositoryId: string;
  finalRecommendation: Recommendation | null;
  modelRecommendation: Recommendation | null;
  partial: boolean;
  createdAt: Date;
}

export interface ReviewDetailVM extends ReviewSummaryVM {
  summary: string | null;
  confidence: number | null;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCost: number | null;
  failureCode: string | null;
  findings: FindingVM[];
}

export interface PublishResultVM {
  publishedSummary: boolean;
  publishedFindingIds: string[];
  skippedAlreadyPublished: string[];
}
