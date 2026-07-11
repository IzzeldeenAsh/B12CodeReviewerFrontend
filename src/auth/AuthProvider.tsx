import { type ReactNode } from 'react';
import { env } from '@/config/env';
import { EntraAuthProvider } from './EntraAuthProvider';
import { TestAuthProvider } from './TestAuthProvider';

/**
 * Selects the authentication implementation from validated env. The choice is
 * made once, at the composition root, so the rest of the app depends only on
 * the shared `useAuth()` contract (§7).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (env.authMode === 'test') {
    return <TestAuthProvider>{children}</TestAuthProvider>;
  }
  return <EntraAuthProvider>{children}</EntraAuthProvider>;
}
