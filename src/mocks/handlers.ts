import { http, HttpResponse } from 'msw';
import { env } from '@/config/env';
import type { ReviewDetailWire } from '@/api/contracts/schemas';
import {
  completedReviewFixture,
  connectionsFixture,
  estimateFixture,
  projectsFixture,
  pullRequestsFixture,
  repositoriesFixture,
} from './fixtures';

/**
 * MSW handlers backing local dev and tests (§21/§22). They model the review
 * lifecycle deterministically: a started review advances QUEUED → FETCHING_PR
 * → ANALYZING → COMPLETED across successive polls, and publish flips finding
 * publish state. No real Azure DevOps / Anthropic calls ever occur.
 */
const base = env.apiBaseUrl;

interface MockReview {
  detail: ReviewDetailWire;
  pollsRemaining: number;
}

const ACTIVE_SEQUENCE = ['QUEUED', 'FETCHING_PR', 'ANALYZING'] as const;

class MockStore {
  private reviews = new Map<string, MockReview>();
  private counter = 1;

  reset(): void {
    this.reviews.clear();
    this.counter = 1;
    // Seed one completed review so history is non-empty.
    const seeded = completedReviewFixture('review-seed');
    this.reviews.set(seeded.id, { detail: seeded, pollsRemaining: 0 });
  }

  start(pullRequestId: number, projectId: string, repositoryId: string): ReviewDetailWire {
    const id = `review-${this.counter++}`;
    const detail: ReviewDetailWire = {
      ...completedReviewFixture(id, {
        pullRequestId,
        projectId,
        repositoryId,
        status: 'QUEUED',
        finalRecommendation: null,
        modelRecommendation: null,
        summary: null,
        confidence: null,
        model: null,
        inputTokens: null,
        outputTokens: null,
        estimatedCost: null,
        findings: [],
      }),
    };
    // Two polls in active states, then complete.
    this.reviews.set(id, { detail, pollsRemaining: ACTIVE_SEQUENCE.length });
    return detail;
  }

  get(id: string): ReviewDetailWire | undefined {
    const entry = this.reviews.get(id);
    if (!entry) return undefined;
    if (entry.pollsRemaining > 0) {
      const index = ACTIVE_SEQUENCE.length - entry.pollsRemaining;
      entry.detail = { ...entry.detail, status: ACTIVE_SEQUENCE[index] ?? 'ANALYZING' };
      entry.pollsRemaining -= 1;
      if (entry.pollsRemaining === 0) {
        entry.detail = completedReviewFixture(id, {
          pullRequestId: entry.detail.pullRequestId,
          projectId: entry.detail.projectId,
          repositoryId: entry.detail.repositoryId,
        });
      }
    }
    return entry.detail;
  }

  cancel(id: string): ReviewDetailWire | undefined {
    const entry = this.reviews.get(id);
    if (!entry) return undefined;
    entry.pollsRemaining = 0;
    entry.detail = { ...entry.detail, status: 'CANCELLED' };
    return entry.detail;
  }

  publish(id: string, findingIds: string[], publishSummary: boolean) {
    const entry = this.reviews.get(id);
    if (!entry) return undefined;
    const already: string[] = [];
    const published: string[] = [];
    entry.detail = {
      ...entry.detail,
      findings: entry.detail.findings.map((f) => {
        if (!findingIds.includes(f.id)) return f;
        if (f.publishState === 'PUBLISHED') {
          already.push(f.id);
          return f;
        }
        published.push(f.id);
        return { ...f, publishState: 'PUBLISHED' };
      }),
    };
    return {
      publishedSummary: publishSummary,
      publishedFindingIds: published,
      skippedAlreadyPublished: already,
    };
  }

  list(): ReviewDetailWire[] {
    return Array.from(this.reviews.values()).map((r) => r.detail);
  }
}

export const mockStore = new MockStore();
mockStore.reset();

const connPrefix = `${base}/azure-devops/connections`;

export const handlers = [
  http.get(connPrefix, () => HttpResponse.json(connectionsFixture)),
  http.post(connPrefix, async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      organization?: string;
      baseUrl?: string;
      credentialType?: string;
      credentialRef?: string;
    };
    return HttpResponse.json({
      id: `conn-${Date.now()}`,
      name: body.name ?? 'New connection',
      organization: body.organization ?? 'org',
      baseUrl: body.baseUrl ?? 'https://dev.azure.com',
      credentialType: body.credentialType ?? 'PAT_ENV',
      credentialRef: body.credentialRef ?? 'REF',
      createdAt: new Date().toISOString(),
    });
  }),
  http.post(`${connPrefix}/:id/test`, () => HttpResponse.json({ ok: true })),
  http.delete(`${connPrefix}/:id`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${connPrefix}/:id/projects`, () => HttpResponse.json(projectsFixture)),
  http.get(`${connPrefix}/:id/projects/:projectId/repositories`, () =>
    HttpResponse.json(repositoriesFixture),
  ),
  http.get(`${connPrefix}/:id/projects/:projectId/repositories/:repositoryId/pull-requests`, () =>
    HttpResponse.json(pullRequestsFixture),
  ),
  http.get(
    `${connPrefix}/:id/projects/:projectId/repositories/:repositoryId/pull-requests/:pullRequestId`,
    ({ params }) => {
      const pr = pullRequestsFixture.find(
        (p) => String(p.pullRequestId) === String(params.pullRequestId),
      );
      return pr
        ? HttpResponse.json(pr)
        : HttpResponse.json(problem(404, 'not-found', 'Pull request not found'), { status: 404 });
    },
  ),

  http.post(`${base}/reviews/estimate`, () => HttpResponse.json(estimateFixture)),
  http.post(`${base}/reviews`, async ({ request }) => {
    const body = (await request.json()) as {
      pullRequestId: number;
      projectId: string;
      repositoryId: string;
    };
    const detail = mockStore.start(body.pullRequestId, body.projectId, body.repositoryId);
    return HttpResponse.json(summaryFrom(detail));
  }),
  http.get(`${base}/reviews`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const status = url.searchParams.get('status');
    let items = mockStore.list();
    if (status) items = items.filter((r) => r.status === status);
    const summaries = items.map(summaryFrom);
    const start = (page - 1) * pageSize;
    return HttpResponse.json({
      items: summaries.slice(start, start + pageSize),
      page,
      pageSize,
      total: summaries.length,
      hasNextPage: start + pageSize < summaries.length,
    });
  }),
  http.get(`${base}/reviews/:reviewId`, ({ params }) => {
    const detail = mockStore.get(String(params.reviewId));
    return detail
      ? HttpResponse.json(detail)
      : HttpResponse.json(problem(404, 'not-found', 'Review not found'), { status: 404 });
  }),
  http.post(`${base}/reviews/:reviewId/cancel`, ({ params }) => {
    const detail = mockStore.cancel(String(params.reviewId));
    return detail
      ? HttpResponse.json(summaryFrom(detail))
      : HttpResponse.json(problem(404, 'not-found', 'Review not found'), { status: 404 });
  }),
  http.post(`${base}/reviews/:reviewId/publish`, async ({ params, request }) => {
    const body = (await request.json()) as { publishSummary: boolean; findingIds: string[] };
    const result = mockStore.publish(
      String(params.reviewId),
      body.findingIds ?? [],
      body.publishSummary,
    );
    return result
      ? HttpResponse.json(result)
      : HttpResponse.json(problem(404, 'not-found', 'Review not found'), { status: 404 });
  }),
];

function summaryFrom(detail: ReviewDetailWire) {
  return {
    id: detail.id,
    status: detail.status,
    pullRequestId: detail.pullRequestId,
    projectId: detail.projectId,
    repositoryId: detail.repositoryId,
    finalRecommendation: detail.finalRecommendation,
    modelRecommendation: detail.modelRecommendation,
    partial: detail.partial,
    createdAt: detail.createdAt,
  };
}

function problem(status: number, type: string, detail: string) {
  return { type, title: type, status, detail };
}
