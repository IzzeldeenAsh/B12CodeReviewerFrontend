/**
 * Validate a post-login "return to" target (§6, §18). Only same-origin,
 * absolute in-app paths are allowed. Anything protocol-relative, absolute-URL,
 * or containing a backslash is rejected to prevent open-redirect attacks.
 */
export function safeReturnTo(raw: string | null | undefined, fallback = '/app'): string {
  if (!raw) return fallback;

  // Must be a root-relative path.
  if (!raw.startsWith('/')) return fallback;
  // Reject protocol-relative ("//evil.com") and backslash tricks ("/\evil.com").
  if (raw.startsWith('//') || raw.includes('\\')) return fallback;
  // Reject anything that still parses as having a scheme or host.
  try {
    const url = new URL(raw, 'https://app.invalid');
    if (url.origin !== 'https://app.invalid') return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
