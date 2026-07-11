import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/render';
import { server } from '@/mocks/server';
import { env } from '@/config/env';
import { ConnectionsPage } from './ConnectionsPage';

describe('ConnectionsPage (MSW integration)', () => {
  it('renders connections loaded from the backend', async () => {
    renderWithProviders(<ConnectionsPage />);
    expect(await screen.findByText('Contoso Payments')).toBeInTheDocument();
    expect(screen.getByText('Fabrikam Web')).toBeInTheDocument();
    // Credential references/values are never surfaced as secrets.
    expect(screen.queryByText(/AZDO_LOCAL_PAT/)).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no connections', async () => {
    server.use(http.get(`${env.apiBaseUrl}/azure-devops/connections`, () => HttpResponse.json([])));
    renderWithProviders(<ConnectionsPage />);
    expect(await screen.findByText(/no connections yet/i)).toBeInTheDocument();
  });

  it('shows a recoverable error state on 500', async () => {
    server.use(
      http.get(`${env.apiBaseUrl}/azure-devops/connections`, () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'x', status: 500, detail: 'boom' },
          { status: 500 },
        ),
      ),
    );
    renderWithProviders(<ConnectionsPage />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
