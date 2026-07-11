import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ColorModeProvider } from '@/theme/ColorModeProvider';
import { AuthProvider } from '@/auth/AuthProvider';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { createQueryClient } from './queryClient';

/**
 * Composition root for cross-cutting providers. Order matters: theme wraps
 * everything (so error/loading UI is themed), then auth (so the token provider
 * is registered before any query runs), then the query client.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <ColorModeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ColorModeProvider>
  );
}
