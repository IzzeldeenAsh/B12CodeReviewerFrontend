import { describe, expect, it } from 'vitest';
import { safeReturnTo } from './safe-redirect';

describe('safeReturnTo', () => {
  it('allows same-origin in-app paths', () => {
    expect(safeReturnTo('/app/reviews')).toBe('/app/reviews');
    expect(safeReturnTo('/app/connections?x=1#h')).toBe('/app/connections?x=1#h');
  });

  it('falls back for absolute and protocol-relative URLs (open redirect defence)', () => {
    expect(safeReturnTo('https://evil.com')).toBe('/app');
    expect(safeReturnTo('//evil.com')).toBe('/app');
    expect(safeReturnTo('/\\evil.com')).toBe('/app');
    expect(safeReturnTo('javascript:alert(1)')).toBe('/app');
  });

  it('falls back for empty/nullish input', () => {
    expect(safeReturnTo(undefined)).toBe('/app');
    expect(safeReturnTo(null)).toBe('/app');
    expect(safeReturnTo('')).toBe('/app');
  });

  it('honours a custom fallback', () => {
    expect(safeReturnTo('bad', '/login')).toBe('/login');
  });
});
