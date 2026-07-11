import { z } from 'zod';

/**
 * Typed, fail-fast validation of the browser-safe environment.
 *
 * Only `VITE_`-prefixed variables exist here and every one of them is embedded
 * into the shipped bundle — they are PUBLIC by definition. This module must
 * never read or expose a secret. Missing/invalid config throws a readable error
 * at startup rather than surfacing as a confusing runtime failure later.
 */
const booleanish = z
  .enum(['true', 'false', ''])
  .optional()
  .transform((v) => v === 'true');

const rawSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_AUTH_MODE: z.enum(['entra', 'test']).default('entra'),
  VITE_ENABLE_MSW: booleanish,

  VITE_ENTRA_CLIENT_ID: z.string().optional(),
  VITE_ENTRA_TENANT_ID: z.string().optional(),
  VITE_ENTRA_REDIRECT_URI: z.string().optional(),
  VITE_ENTRA_API_SCOPE: z.string().optional(),

  VITE_TEST_USER_OID: z.string().optional(),
  VITE_TEST_USER_EMAIL: z.string().optional(),
  VITE_TEST_USER_NAME: z.string().optional(),
});

export interface AppEnv {
  apiBaseUrl: string;
  authMode: 'entra' | 'test';
  enableMsw: boolean;
  isProduction: boolean;
  entra: {
    clientId: string;
    tenantId: string;
    redirectUri: string;
    apiScope: string;
  };
  testUser: {
    oid: string;
    email: string;
    name: string;
  };
}

function parseEnv(source: Record<string, unknown>, isProduction: boolean): AppEnv {
  const parsed = rawSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid frontend environment configuration:\n${issues}`);
  }
  const e = parsed.data;

  // Test auth is a development-only escape hatch. It must be impossible to ship
  // it in a production build even by misconfiguration.
  if (isProduction && e.VITE_AUTH_MODE === 'test') {
    throw new Error(
      'VITE_AUTH_MODE=test is forbidden in a production build. Configure Microsoft Entra ID.',
    );
  }

  if (e.VITE_AUTH_MODE === 'entra') {
    const missing = (
      [
        'VITE_ENTRA_CLIENT_ID',
        'VITE_ENTRA_TENANT_ID',
        'VITE_ENTRA_REDIRECT_URI',
        'VITE_ENTRA_API_SCOPE',
      ] as const
    ).filter((k) => !e[k]);
    if (missing.length > 0) {
      throw new Error(
        `VITE_AUTH_MODE=entra requires: ${missing.join(', ')}. Set them or use VITE_AUTH_MODE=test for local dev.`,
      );
    }
  }

  return {
    apiBaseUrl: e.VITE_API_BASE_URL.replace(/\/+$/, ''),
    authMode: e.VITE_AUTH_MODE,
    enableMsw: e.VITE_ENABLE_MSW && !isProduction,
    isProduction,
    entra: {
      clientId: e.VITE_ENTRA_CLIENT_ID ?? '',
      tenantId: e.VITE_ENTRA_TENANT_ID ?? '',
      redirectUri: e.VITE_ENTRA_REDIRECT_URI ?? '',
      apiScope: e.VITE_ENTRA_API_SCOPE ?? '',
    },
    testUser: {
      oid: e.VITE_TEST_USER_OID ?? 'dev-user-oid',
      email: e.VITE_TEST_USER_EMAIL ?? 'dev@local.test',
      name: e.VITE_TEST_USER_NAME ?? 'Local Developer',
    },
  };
}

export const env: AppEnv = parseEnv(import.meta.env, import.meta.env.PROD);

/** Exposed for unit testing the parser with arbitrary inputs. */
export const __parseEnvForTest = parseEnv;
