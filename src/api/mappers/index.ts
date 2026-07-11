import { parseDate, shortBranchName, shortCommit } from '@/utils/format';
import type {
  ConnectionVM,
  EstimateVM,
  FindingVM,
  ProjectVM,
  PullRequestVM,
  PublishResultVM,
  RepositoryVM,
  ReviewDetailVM,
  ReviewSummaryVM,
} from '@/types/view-models';
import type {
  ConnectionWire,
  EstimateWire,
  FindingWire,
  ProjectWire,
  PublishResultWire,
  PullRequestWire,
  RepositoryWire,
  ReviewDetailWire,
  ReviewSummaryWire,
} from '../contracts/schemas';
import {
  toCategory,
  toCredentialType,
  toPublishState,
  toRecommendation,
  toReviewStatus,
  toSeverity,
} from './enum-guards';

/**
 * DTO -> view model mappers. The ONLY place wire shapes cross into the app's
 * stable presentation types. Keeps enum narrowing, branch/commit shortening,
 * and date parsing in one tested place instead of spread across components.
 */

export function toConnectionVM(w: ConnectionWire): ConnectionVM {
  return {
    id: w.id,
    name: w.name,
    organization: w.organization,
    baseUrl: w.baseUrl,
    credentialType: toCredentialType(w.credentialType),
    credentialRef: w.credentialRef,
    createdAt: parseDate(w.createdAt) ?? new Date(0),
  };
}

export function toProjectVM(w: ProjectWire): ProjectVM {
  return { id: w.id, name: w.name, ...(w.description ? { description: w.description } : {}) };
}

export function toRepositoryVM(w: RepositoryWire): RepositoryVM {
  return {
    id: w.id,
    name: w.name,
    projectId: w.projectId,
    ...(w.defaultBranch ? { defaultBranch: shortBranchName(w.defaultBranch) } : {}),
    isDisabled: w.isDisabled ?? false,
  };
}

export function toPullRequestVM(w: PullRequestWire): PullRequestVM {
  return {
    pullRequestId: w.pullRequestId,
    title: w.title,
    ...(w.description ? { description: w.description } : {}),
    status: w.status,
    sourceBranch: shortBranchName(w.sourceRefName),
    targetBranch: shortBranchName(w.targetRefName),
    ...(w.authorDisplayName ? { author: w.authorDisplayName } : {}),
    ...(shortCommit(w.lastMergeSourceCommitId)
      ? { sourceCommitShort: shortCommit(w.lastMergeSourceCommitId) }
      : {}),
    ...(shortCommit(w.lastMergeTargetCommitId)
      ? { targetCommitShort: shortCommit(w.lastMergeTargetCommitId) }
      : {}),
    ...(parseDate(w.creationDate) ? { createdAt: parseDate(w.creationDate) } : {}),
    isDraft: w.isDraft ?? false,
  };
}

export function toEstimateVM(w: EstimateWire): EstimateVM {
  return {
    fileCount: w.fileCount,
    changedLines: w.changedLines,
    estimatedInputTokens: w.estimatedInputTokens,
    estimatedCost: w.estimatedCost,
    skippedFiles: w.skippedFiles.map((s) => ({ path: s.path, reason: s.reason })),
    withinLimits: w.withinLimits,
    warnings: w.warnings,
  };
}

export function toFindingVM(w: FindingWire): FindingVM {
  const publishState = toPublishState(w.publishState);
  return {
    id: w.id,
    severity: toSeverity(w.severity),
    category: toCategory(w.category),
    filePath: w.filePath,
    lineNumber: w.lineNumber,
    title: w.title,
    explanation: w.explanation,
    evidence: w.evidence,
    suggestedFix: w.suggestedFix,
    confidence: w.confidence,
    isInline: w.isInline,
    publishState,
    isPublished: publishState === 'PUBLISHED',
  };
}

export function toReviewSummaryVM(w: ReviewSummaryWire): ReviewSummaryVM {
  return {
    id: w.id,
    status: toReviewStatus(w.status),
    pullRequestId: w.pullRequestId,
    projectId: w.projectId,
    repositoryId: w.repositoryId,
    finalRecommendation: toRecommendation(w.finalRecommendation),
    modelRecommendation: toRecommendation(w.modelRecommendation),
    partial: w.partial,
    createdAt: parseDate(w.createdAt) ?? new Date(0),
  };
}

export function toReviewDetailVM(w: ReviewDetailWire): ReviewDetailVM {
  const cost = w.estimatedCost === null ? null : Number.parseFloat(w.estimatedCost);
  return {
    ...toReviewSummaryVM(w),
    summary: w.summary,
    confidence: w.confidence,
    model: w.model,
    inputTokens: w.inputTokens,
    outputTokens: w.outputTokens,
    estimatedCost: cost !== null && Number.isFinite(cost) ? cost : null,
    failureCode: w.failureCode,
    findings: w.findings.map(toFindingVM),
  };
}

export function toPublishResultVM(w: PublishResultWire): PublishResultVM {
  return {
    publishedSummary: w.publishedSummary,
    publishedFindingIds: w.publishedFindingIds,
    skippedAlreadyPublished: w.skippedAlreadyPublished,
  };
}
