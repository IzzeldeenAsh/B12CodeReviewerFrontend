import type {
  ConnectionWire,
  EstimateWire,
  FindingWire,
  ProjectWire,
  PullRequestWire,
  RepositoryWire,
  ReviewDetailWire,
  ReviewSummaryWire,
} from '@/api/contracts/schemas';

/**
 * Deterministic fixtures for MSW and tests (§21). No real Azure DevOps, Entra,
 * or Anthropic data. Ids are stable so tests can assert against them.
 */
export const connectionsFixture: ConnectionWire[] = [
  {
    id: 'conn-1',
    name: 'Contoso Payments',
    organization: 'contoso',
    baseUrl: 'https://dev.azure.com',
    credentialType: 'PAT_ENV',
    credentialRef: 'AZDO_LOCAL_PAT',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'conn-2',
    name: 'Fabrikam Web',
    organization: 'fabrikam',
    baseUrl: 'https://dev.azure.com',
    credentialType: 'PAT_KEY_VAULT',
    credentialRef: 'azdo-fabrikam',
    createdAt: '2026-06-15T09:30:00.000Z',
  },
];

export const projectsFixture: ProjectWire[] = [
  { id: 'proj-1', name: 'Checkout', description: 'Payment checkout services' },
  { id: 'proj-2', name: 'Platform', description: 'Shared platform libraries' },
];

export const repositoriesFixture: RepositoryWire[] = [
  { id: 'repo-1', name: 'checkout-api', projectId: 'proj-1', defaultBranch: 'refs/heads/main' },
  { id: 'repo-2', name: 'checkout-web', projectId: 'proj-1', defaultBranch: 'refs/heads/main' },
];

export const pullRequestsFixture: PullRequestWire[] = [
  {
    pullRequestId: 42,
    title: 'Add idempotency keys to payment capture',
    description: 'Introduces idempotency keys so retried captures do not double-charge.',
    status: 'active',
    sourceRefName: 'refs/heads/feature/idempotency',
    targetRefName: 'refs/heads/main',
    authorDisplayName: 'Dana Reviewer',
    lastMergeSourceCommitId: 'abc1234def5678',
    lastMergeTargetCommitId: 'target9876abcd',
    creationDate: '2026-07-01T08:00:00.000Z',
    isDraft: false,
  },
  {
    pullRequestId: 43,
    title: 'Refactor retry backoff',
    status: 'active',
    sourceRefName: 'refs/heads/feature/backoff',
    targetRefName: 'refs/heads/main',
    authorDisplayName: 'Sam Author',
    creationDate: '2026-07-05T12:00:00.000Z',
    isDraft: true,
  },
];

export const estimateFixture: EstimateWire = {
  fileCount: 6,
  changedLines: 214,
  estimatedInputTokens: 18450,
  estimatedCost: 0.11,
  skippedFiles: [{ path: 'pnpm-lock.yaml', reason: 'Lockfile excluded from review' }],
  withinLimits: true,
  warnings: [],
};

export const findingsFixture: FindingWire[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    severity: 'BLOCKER',
    category: 'SECURITY',
    filePath: 'src/payments/capture.ts',
    lineNumber: 88,
    title: 'Idempotency key is not validated before use',
    explanation: 'The idempotency key from the request is used directly to build a cache key.',
    evidence: 'const cacheKey = `capture:${req.headers["idempotency-key"]}`;',
    suggestedFix: 'Validate the key format and length before using it.',
    confidence: 0.92,
    isInline: true,
    publishState: 'UNPUBLISHED',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    severity: 'MEDIUM',
    category: 'RELIABILITY',
    filePath: 'src/payments/retry.ts',
    lineNumber: 40,
    title: 'Retry loop lacks a maximum attempt cap',
    explanation: 'The backoff loop can retry indefinitely under sustained failure.',
    evidence: 'while (true) { await attempt(); }',
    suggestedFix: 'Add a bounded attempt counter and surface a terminal error.',
    confidence: 0.71,
    isInline: true,
    publishState: 'UNPUBLISHED',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    severity: 'LOW',
    category: 'MAINTAINABILITY',
    filePath: null,
    lineNumber: null,
    title: 'Consider documenting the idempotency contract',
    explanation: 'A short doc comment would help future maintainers.',
    evidence: 'No documentation found for capture idempotency.',
    suggestedFix: null,
    confidence: 0.55,
    isInline: false,
    publishState: 'UNPUBLISHED',
  },
];

export function completedReviewFixture(
  id: string,
  overrides?: Partial<ReviewDetailWire>,
): ReviewDetailWire {
  return {
    id,
    status: 'COMPLETED',
    pullRequestId: 42,
    projectId: 'proj-1',
    repositoryId: 'repo-1',
    finalRecommendation: 'REQUEST_CHANGES',
    modelRecommendation: 'HUMAN_REVIEW',
    partial: false,
    createdAt: '2026-07-10T08:00:00.000Z',
    summary: 'The idempotency implementation is close but has one blocking security issue.',
    confidence: 0.86,
    model: 'claude-sonnet-5',
    inputTokens: 18450,
    outputTokens: 1230,
    estimatedCost: '0.12',
    failureCode: null,
    findings: findingsFixture,
    ...overrides,
  };
}

export function reviewSummaryFixture(id: string, status = 'QUEUED'): ReviewSummaryWire {
  return {
    id,
    status,
    pullRequestId: 42,
    projectId: 'proj-1',
    repositoryId: 'repo-1',
    finalRecommendation: null,
    modelRecommendation: null,
    partial: false,
    createdAt: '2026-07-10T08:00:00.000Z',
  };
}
