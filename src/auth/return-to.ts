const RETURN_TO_KEY = 'b12.returnTo';

/** Persist a post-login destination across an MSAL redirect. */
export function storeReturnTo(returnTo: string): void {
  sessionStorage.setItem(RETURN_TO_KEY, returnTo);
}

/** Consume and clear the stored post-login destination (validate before use). */
export function consumeReturnTo(): string | null {
  const value = sessionStorage.getItem(RETURN_TO_KEY);
  if (value) sessionStorage.removeItem(RETURN_TO_KEY);
  return value;
}
