import {
  LogLevel,
  type Configuration,
  type PopupRequest,
  type RedirectRequest,
} from '@azure/msal-browser';
import { env } from '@/config/env';

/**
 * MSAL configuration for Authorization Code Flow with PKCE (§7).
 *
 * - Tokens are cached in sessionStorage (cleared on tab close) rather than
 *   localStorage, reducing the window in which a token is at rest.
 * - Only browser-safe public identifiers are used; there is NO client secret.
 * - MSAL is never asked to log PII, and token values are never logged (§18).
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: env.entra.clientId,
    authority: `https://login.microsoftonline.com/${env.entra.tenantId}`,
    redirectUri: env.entra.redirectUri,
    postLogoutRedirectUri: env.entra.redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      piiLoggingEnabled: false,
      logLevel: env.isProduction ? LogLevel.Error : LogLevel.Warning,
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) {
          console.error(`[msal] ${message}`);
        }
      },
    },
  },
};

/** Scopes required to call the backend API on the user's behalf. */
export const apiTokenRequest = { scopes: [env.entra.apiScope] };

/** Interactive sign-in requests. openid/profile/email plus the API scope. */
export const loginRequest: RedirectRequest & PopupRequest = {
  scopes: ['openid', 'profile', 'email', env.entra.apiScope],
};
