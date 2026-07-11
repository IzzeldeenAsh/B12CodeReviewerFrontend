import { describe, expect, it } from 'vitest';
import { __parseEnvForTest } from './env';

const base = {
  VITE_API_BASE_URL: 'http://localhost:3000/api/v1',
  VITE_ENTRA_CLIENT_ID: 'cid',
  VITE_ENTRA_TENANT_ID: 'tid',
  VITE_ENTRA_REDIRECT_URI: 'http://localhost:5173/auth/callback',
  VITE_ENTRA_API_SCOPE: 'api://x/access',
};

describe('env validation', () => {
  it('parses a valid entra config and strips trailing slashes', () => {
    const env = __parseEnvForTest({ ...base, VITE_API_BASE_URL: 'http://x/api/v1/' }, false);
    expect(env.apiBaseUrl).toBe('http://x/api/v1');
    expect(env.authMode).toBe('entra');
  });

  it('forbids test auth in a production build', () => {
    expect(() => __parseEnvForTest({ ...base, VITE_AUTH_MODE: 'test' }, true)).toThrow(
      /forbidden/i,
    );
  });

  it('disables MSW in production even if requested', () => {
    const env = __parseEnvForTest({ ...base, VITE_ENABLE_MSW: 'true' }, true);
    expect(env.enableMsw).toBe(false);
  });

  it('requires entra fields when auth mode is entra', () => {
    expect(() =>
      __parseEnvForTest({ VITE_API_BASE_URL: 'http://x', VITE_AUTH_MODE: 'entra' }, false),
    ).toThrow(/requires/i);
  });

  it('allows test mode without entra fields in dev', () => {
    const env = __parseEnvForTest({ VITE_API_BASE_URL: 'http://x', VITE_AUTH_MODE: 'test' }, false);
    expect(env.authMode).toBe('test');
  });
});
