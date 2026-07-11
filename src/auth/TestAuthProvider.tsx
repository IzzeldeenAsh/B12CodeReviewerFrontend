import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { env } from '@/config/env';
import { setTokenProvider } from './token-provider';
import { AuthContext, type AuthContextValue } from './auth-context';

/**
 * ISOLATED development/test authentication (§7). Mirrors the backend's
 * AUTH_MODE=test header strategy: instead of a real token it sends
 * `x-test-user-*` headers. It can only be selected when VITE_AUTH_MODE=test,
 * which the env validator forbids in a production build — so this can never be
 * reached in production even by misconfiguration.
 */
const SESSION_KEY = 'b12.testAuth.signedIn';

export function TestAuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === 'true',
  );

  useEffect(() => {
    // Register the header-based token provider for the API client.
    setTokenProvider({
      getAuthHeaders: () =>
        Promise.resolve({
          'x-test-user-oid': env.testUser.oid,
          'x-test-user-email': env.testUser.email,
          'x-test-user-name': env.testUser.name,
        }),
      onUnauthenticated: () => {
        sessionStorage.removeItem(SESSION_KEY);
        setSignedIn(false);
      },
    });
    return () => setTokenProvider(null);
  }, []);

  const login = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setSignedIn(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSignedIn(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: signedIn ? 'authenticated' : 'unauthenticated',
      user: signedIn ? { name: env.testUser.name, email: env.testUser.email } : null,
      login,
      logout,
    }),
    [signedIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
