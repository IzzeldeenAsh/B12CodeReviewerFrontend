import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  InteractionRequiredAuthError,
  InteractionStatus,
  PublicClientApplication,
  type AccountInfo,
} from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { setTokenProvider } from './token-provider';
import { apiTokenRequest, loginRequest, msalConfig } from './msal-config';
import { AuthContext, type AuthContextValue } from './auth-context';
import { storeReturnTo } from './return-to';

/**
 * Microsoft Entra ID authentication boundary (§7). Wraps the app in MSAL and
 * exposes the shared AuthContext. Backend API tokens are acquired silently and
 * attached centrally by the API client — components never touch tokens.
 */
const pca = new PublicClientApplication(msalConfig);

export function EntraAuthProvider({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={pca}>
      <EntraAuthBridge>{children}</EntraAuthBridge>
    </MsalProvider>
  );
}

function accountToUser(account: AccountInfo) {
  return {
    name: account.name ?? account.username,
    email: account.username,
  };
}

function EntraAuthBridge({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const account = accounts[0];
  const accountRef = useRef<AccountInfo | undefined>(account);
  accountRef.current = account;

  useEffect(() => {
    setTokenProvider({
      getAuthHeaders: async (): Promise<Record<string, string>> => {
        const active = accountRef.current;
        if (!active) return {};
        try {
          const result = await instance.acquireTokenSilent({ ...apiTokenRequest, account: active });
          return { Authorization: `Bearer ${result.accessToken}` };
        } catch (error) {
          // Consent- or interaction-required: fall back to an interactive flow.
          if (error instanceof InteractionRequiredAuthError) {
            await instance.acquireTokenRedirect({ ...apiTokenRequest, account: active });
          }
          return {};
        }
      },
      onUnauthenticated: () => {
        // Token rejected by the backend: force a fresh interactive sign-in.
        void instance.acquireTokenRedirect(loginRequest);
      },
    });
    return () => setTokenProvider(null);
  }, [instance]);

  const login = useCallback(
    (returnTo?: string) => {
      if (returnTo) storeReturnTo(returnTo);
      void instance.loginRedirect(loginRequest);
    },
    [instance],
  );

  const logout = useCallback(() => {
    void instance.logoutRedirect({ account: accountRef.current ?? null });
  }, [instance]);

  const status: AuthContextValue['status'] =
    inProgress !== InteractionStatus.None && inProgress !== InteractionStatus.Startup
      ? 'loading'
      : account
        ? 'authenticated'
        : 'unauthenticated';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: account ? accountToUser(account) : null,
      login,
      logout,
    }),
    [status, account, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
