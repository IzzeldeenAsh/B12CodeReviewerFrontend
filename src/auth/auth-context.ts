import { createContext, useContext } from 'react';

/** The authenticated principal exposed to the app (never carries a token). */
export interface AuthUserInfo {
  name: string;
  email: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUserInfo | null;
  /** Begin interactive sign-in. `returnTo` is validated before use (no open redirect). */
  login: (returnTo?: string) => void;
  logout: () => void;
  /** Safe, user-facing error text when status === 'error'. */
  errorMessage?: string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
