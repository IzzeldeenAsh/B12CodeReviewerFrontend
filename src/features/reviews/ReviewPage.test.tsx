import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/render';
import { server } from '@/mocks/server';
import { env } from '@/config/env';
import { completedReviewFixture } from '@/mocks/fixtures';
import { ReviewPage } from './ReviewPage';

function renderReview(reviewId = 'review-seed') {
  return renderWithProviders(<ReviewPage />, {
    route: `/app/reviews/${reviewId}`,
    path: '/app/reviews/:reviewId',
  });
}

describe('ReviewPage (MSW integration)', () => {
  it('renders a completed review with its recommendation and findings', async () => {
    renderReview();
    expect(await screen.findByText('Request changes')).toBeInTheDocument();
    expect(screen.getByText(/idempotency key is not validated/i)).toBeInTheDocument();
    // Advisory disclaimer is always present.
    expect(screen.getByText(/a human reviewer makes the final decision/i)).toBeInTheDocument();
  });

  it('publishes only selected findings and leaves others unpublished', async () => {
    const user = userEvent.setup();
    renderReview();

    const firstFinding = await screen.findByLabelText(
      /select finding: idempotency key is not validated/i,
    );
    await user.click(firstFinding);

    await user.click(screen.getByRole('button', { name: /preview and publish/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /publish selected comments/i }));

    // Success alert announces the published finding.
    expect(await screen.findByText(/comments published/i)).toBeInTheDocument();

    // The published finding now shows a Published chip; the others do not.
    await waitFor(() => {
      expect(screen.getAllByText('Published').length).toBe(1);
    });
  });

  it('blocks publishing for a stale review', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/reviews/stale-1`, () =>
        HttpResponse.json(completedReviewFixture('stale-1', { status: 'STALE' })),
      ),
    );
    renderReview('stale-1');
    expect(await screen.findByText(/pull request changed after this review/i)).toBeInTheDocument();
    expect(
      screen.getByText(/publishing is unavailable because this review is no longer/i),
    ).toBeInTheDocument();
  });

  it('shows a failure state without any publish controls', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/reviews/failed-1`, () =>
        HttpResponse.json(
          completedReviewFixture('failed-1', {
            status: 'FAILED',
            finalRecommendation: null,
            findings: [],
          }),
        ),
      ),
    );
    renderReview('failed-1');
    expect(await screen.findByText(/review failed/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /preview and publish/i })).not.toBeInTheDocument();
  });
});
