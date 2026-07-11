/**
 * Indirection between the API client and whatever supplies auth headers.
 *
 * The client must NOT import MSAL (§5 boundary: visual/data layers never read
 * tokens directly). Instead the auth layer registers a provider at startup:
 *  - Entra mode: acquires a backend access token silently via MSAL.
 *  - Test mode: returns the isolated `x-test-user-*` dev headers.
 *
 * Access tokens are returned to the client for a single request and are never
 * logged, stored, or placed in a URL.
 */
export interface TokenProvider {
  /** Resolve the headers to attach to an authenticated request. */
  getAuthHeaders(): Promise<Record<string, string>>;
  /** Invoked on a 401 so the auth layer can trigger interactive re-auth. */
  onUnauthenticated?(): void;
}

let activeProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider | null): void {
  activeProvider = provider;
}

export function getTokenProvider(): TokenProvider | null {
  return activeProvider;
}
