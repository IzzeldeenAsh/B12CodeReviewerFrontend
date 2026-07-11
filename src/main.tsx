import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import { AppProviders } from '@/app/providers';
import { App } from '@/app/App';
import { env } from '@/config/env';

/**
 * Application entry. When MSW is enabled (local dev only), the mock worker is
 * started before the app renders so the very first query is intercepted.
 */
async function enableMocking(): Promise<void> {
  if (!env.enableMsw) return;
  const { worker } = await import('@/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

async function bootstrap(): Promise<void> {
  await enableMocking();
  const container = document.getElementById('root');
  if (!container) throw new Error('Root element #root not found.');
  createRoot(container).render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>,
  );
}

void bootstrap();
