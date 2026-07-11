import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { buildTheme } from '@/theme/theme';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext, type AuthContextValue } from '@/auth/auth-context';

/**
 * Test render helper. Wraps a component in the real providers (theme, query,
 * toast, router) with a fresh, retry-disabled QueryClient and a stub auth
 * context, so component + MSW-integration tests exercise the real stack.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

const stubAuth: AuthContextValue = {
  status: 'authenticated',
  user: { name: 'Test User', email: 'test@local' },
  login: () => {},
  logout: () => {},
};

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  path?: string;
  queryClient?: QueryClient;
  auth?: Partial<AuthContextValue>;
}

export function renderWithProviders(ui: ReactElement, options: Options = {}): RenderResult {
  const { route = '/', path, queryClient = createTestQueryClient(), auth, ...rest } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    const authValue = { ...stubAuth, ...auth };
    const content = path ? (
      <Routes>
        <Route path={path} element={children} />
      </Routes>
    ) : (
      children
    );
    return (
      <ThemeProvider theme={buildTheme('light')}>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={authValue}>
            <ToastProvider>
              <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
            </ToastProvider>
          </AuthContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...rest });
}
