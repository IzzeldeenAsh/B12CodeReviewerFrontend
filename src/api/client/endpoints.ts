import { request } from './http-client';
import {
  connectionListSchema,
  connectionSchema,
  connectionTestSchema,
  estimateSchema,
  projectListSchema,
  pullRequestListSchema,
  pullRequestSchema,
  repositoryListSchema,
  reviewDetailSchema,
  reviewPageSchema,
  reviewSummarySchema,
  publishResultSchema,
  type ConnectionWire,
  type EstimateWire,
  type ProjectWire,
  type PullRequestWire,
  type RepositoryWire,
  type ReviewDetailWire,
  type ReviewPageWire,
  type ReviewSummaryWire,
  type PublishResultWire,
} from '../contracts/schemas';
import type {
  CreateConnectionRequest,
  EstimateReviewRequest,
  PublishReviewRequest,
  StartReviewRequest,
} from '../contracts/requests';

/**
 * One function per backend endpoint. These are the ONLY places REST paths and
 * query strings are constructed. Feature hooks call these; components never do.
 * Every function forwards an AbortSignal so TanStack Query can cancel obsolete
 * requests during navigation.
 */

const enc = encodeURIComponent;

// --- Connections ---------------------------------------------------------

export function listConnections(signal?: AbortSignal): Promise<ConnectionWire[]> {
  return request('/azure-devops/connections', { schema: connectionListSchema, signal });
}

export function createConnection(input: CreateConnectionRequest): Promise<ConnectionWire> {
  return request('/azure-devops/connections', {
    method: 'POST',
    body: input,
    schema: connectionSchema,
  });
}

export function testConnection(id: string): Promise<{ ok: boolean }> {
  return request(`/azure-devops/connections/${enc(id)}/test`, {
    method: 'POST',
    schema: connectionTestSchema,
  });
}

export function deleteConnection(id: string): Promise<void> {
  return request(`/azure-devops/connections/${enc(id)}`, { method: 'DELETE' });
}

// --- Browse --------------------------------------------------------------

export function listProjects(connectionId: string, signal?: AbortSignal): Promise<ProjectWire[]> {
  return request(`/azure-devops/connections/${enc(connectionId)}/projects`, {
    schema: projectListSchema,
    signal,
  });
}

export function listRepositories(
  connectionId: string,
  projectId: string,
  signal?: AbortSignal,
): Promise<RepositoryWire[]> {
  return request(
    `/azure-devops/connections/${enc(connectionId)}/projects/${enc(projectId)}/repositories`,
    { schema: repositoryListSchema, signal },
  );
}

export function listPullRequests(
  connectionId: string,
  projectId: string,
  repositoryId: string,
  signal?: AbortSignal,
): Promise<PullRequestWire[]> {
  return request(
    `/azure-devops/connections/${enc(connectionId)}/projects/${enc(projectId)}/repositories/${enc(
      repositoryId,
    )}/pull-requests`,
    { schema: pullRequestListSchema, signal },
  );
}

export function getPullRequest(
  connectionId: string,
  projectId: string,
  repositoryId: string,
  pullRequestId: number,
  signal?: AbortSignal,
): Promise<PullRequestWire> {
  return request(
    `/azure-devops/connections/${enc(connectionId)}/projects/${enc(projectId)}/repositories/${enc(
      repositoryId,
    )}/pull-requests/${pullRequestId}`,
    { schema: pullRequestSchema, signal },
  );
}

// --- Reviews -------------------------------------------------------------

export function estimateReview(input: EstimateReviewRequest): Promise<EstimateWire> {
  return request('/reviews/estimate', { method: 'POST', body: input, schema: estimateSchema });
}

export function startReview(input: StartReviewRequest): Promise<ReviewSummaryWire> {
  return request('/reviews', { method: 'POST', body: input, schema: reviewSummarySchema });
}

export function getReview(reviewId: string, signal?: AbortSignal): Promise<ReviewDetailWire> {
  return request(`/reviews/${enc(reviewId)}`, { schema: reviewDetailSchema, signal });
}

export function listReviews(
  params: { page: number; pageSize: number; status?: string },
  signal?: AbortSignal,
): Promise<ReviewPageWire> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.status) query.set('status', params.status);
  return request(`/reviews?${query.toString()}`, { schema: reviewPageSchema, signal });
}

export function cancelReview(reviewId: string): Promise<ReviewSummaryWire> {
  return request(`/reviews/${enc(reviewId)}/cancel`, {
    method: 'POST',
    schema: reviewSummarySchema,
  });
}

export function publishReview(
  reviewId: string,
  input: PublishReviewRequest,
): Promise<PublishResultWire> {
  return request(`/reviews/${enc(reviewId)}/publish`, {
    method: 'POST',
    body: input,
    schema: publishResultSchema,
  });
}
