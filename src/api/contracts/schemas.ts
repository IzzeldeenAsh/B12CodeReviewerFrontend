import { z } from 'zod';

/**
 * Zod contracts mirroring the backend DTOs (NestJS `@nestjs/swagger` classes).
 *
 * WHY Zod instead of OpenAPI-generated types: the backend does not currently
 * publish a committed openapi.json, only a live Swagger UI. Validating at the
 * boundary means a contract drift surfaces as a clear parse error in one place
 * (the API client) instead of `undefined` deep inside a component. When an
 * openapi.json is published, these can be regenerated — see
 * docs/frontend-architecture.md and `/api-contract-check`.
 *
 * These describe the WIRE shape only. Presentation view models are derived in
 * `src/api/mappers`. Enums are intentionally kept as `z.string()` at the
 * boundary and narrowed in mappers so an unexpected backend value degrades
 * gracefully instead of throwing.
 */

// --- Connections ---------------------------------------------------------

export const connectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  organization: z.string(),
  baseUrl: z.string(),
  credentialType: z.string(),
  credentialRef: z.string(),
  createdAt: z.string(),
});
export type ConnectionWire = z.infer<typeof connectionSchema>;
export const connectionListSchema = z.array(connectionSchema);

export const connectionTestSchema = z.object({ ok: z.boolean() });

// --- Azure DevOps browse -------------------------------------------------

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});
export type ProjectWire = z.infer<typeof projectSchema>;
export const projectListSchema = z.array(projectSchema);

export const repositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  defaultBranch: z.string().optional(),
  isDisabled: z.boolean().optional(),
});
export type RepositoryWire = z.infer<typeof repositorySchema>;
export const repositoryListSchema = z.array(repositorySchema);

export const pullRequestSchema = z.object({
  pullRequestId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  sourceRefName: z.string(),
  targetRefName: z.string(),
  authorDisplayName: z.string().optional(),
  lastMergeSourceCommitId: z.string().optional(),
  lastMergeTargetCommitId: z.string().optional(),
  creationDate: z.string().optional(),
  isDraft: z.boolean().optional(),
});
export type PullRequestWire = z.infer<typeof pullRequestSchema>;
export const pullRequestListSchema = z.array(pullRequestSchema);

// --- Reviews -------------------------------------------------------------

export const estimateSchema = z.object({
  fileCount: z.number(),
  changedLines: z.number(),
  estimatedInputTokens: z.number(),
  estimatedCost: z.number().nullable(),
  skippedFiles: z.array(z.object({ path: z.string(), reason: z.string() })),
  withinLimits: z.boolean(),
  warnings: z.array(z.string()),
});
export type EstimateWire = z.infer<typeof estimateSchema>;

export const findingSchema = z.object({
  id: z.string(),
  severity: z.string(),
  category: z.string(),
  filePath: z.string().nullable(),
  lineNumber: z.number().nullable(),
  title: z.string(),
  explanation: z.string(),
  evidence: z.string(),
  suggestedFix: z.string().nullable(),
  confidence: z.number(),
  isInline: z.boolean(),
  publishState: z.string(),
});
export type FindingWire = z.infer<typeof findingSchema>;

export const reviewSummarySchema = z.object({
  id: z.string(),
  status: z.string(),
  pullRequestId: z.number(),
  projectId: z.string(),
  repositoryId: z.string(),
  finalRecommendation: z.string().nullable(),
  modelRecommendation: z.string().nullable(),
  partial: z.boolean(),
  createdAt: z.string(),
});
export type ReviewSummaryWire = z.infer<typeof reviewSummarySchema>;

export const reviewDetailSchema = reviewSummarySchema.extend({
  summary: z.string().nullable(),
  confidence: z.number().nullable(),
  model: z.string().nullable(),
  inputTokens: z.number().nullable(),
  outputTokens: z.number().nullable(),
  estimatedCost: z.string().nullable(),
  failureCode: z.string().nullable(),
  findings: z.array(findingSchema),
});
export type ReviewDetailWire = z.infer<typeof reviewDetailSchema>;

export const publishResultSchema = z.object({
  publishedSummary: z.boolean(),
  publishedFindingIds: z.array(z.string()),
  skippedAlreadyPublished: z.array(z.string()),
});
export type PublishResultWire = z.infer<typeof publishResultSchema>;

/** Uniform paginated envelope (PaginatedDto). */
export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    hasNextPage: z.boolean(),
  });
}
export const reviewPageSchema = paginatedSchema(reviewSummarySchema);
export type ReviewPageWire = z.infer<typeof reviewPageSchema>;

/** RFC 7807 problem+json, as produced by the backend ProblemDetailsFilter. */
export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number(),
  detail: z.string(),
  instance: z.string().optional(),
  correlationId: z.string().optional(),
  errors: z.unknown().optional(),
});
export type ProblemDetailsWire = z.infer<typeof problemDetailsSchema>;
