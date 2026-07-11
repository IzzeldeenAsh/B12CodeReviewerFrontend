import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { RecommendationPanel } from './RecommendationPanel';

describe('RecommendationPanel', () => {
  it('shows the label, headline, and mandatory AI disclaimer', () => {
    renderWithProviders(
      <RecommendationPanel finalRecommendation="REQUEST_CHANGES" confidence={0.8} />,
    );
    expect(screen.getByText('Request changes')).toBeInTheDocument();
    expect(screen.getByText(/important issues should be addressed/i)).toBeInTheDocument();
    expect(screen.getByText(/a human reviewer makes the final decision/i)).toBeInTheDocument();
  });

  it('never renders an approve/reject/merge action', () => {
    renderWithProviders(<RecommendationPanel finalRecommendation="APPROVE" confidence={0.9} />);
    const buttons = screen.queryAllByRole('button');
    for (const btn of buttons) {
      expect(btn.textContent?.toLowerCase()).not.toMatch(/approve|reject|merge|vote|complete/);
    }
  });

  it('surfaces the model recommendation when it differs', () => {
    renderWithProviders(
      <RecommendationPanel
        finalRecommendation="REQUEST_CHANGES"
        modelRecommendation="HUMAN_REVIEW"
        confidence={0.7}
      />,
    );
    expect(screen.getByText(/model’s own recommendation/i)).toBeInTheDocument();
  });
});
