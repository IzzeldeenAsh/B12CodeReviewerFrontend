# Authentication setup

The frontend authenticates dashboard users with **Microsoft Entra ID** (MSAL,
Authorization Code + PKCE) and calls the backend with an Entra access token.

## Modes

- **`VITE_AUTH_MODE=entra`** (production/staging): real Entra sign-in.
- **`VITE_AUTH_MODE=test`** (local dev / e2e only): an isolated header-based
  principal that mirrors the backend's `AUTH_MODE=test`. It sends
  `x-test-user-oid/email/name` instead of a token. **A production build refuses
  to enable it** (enforced in `src/config/env.ts`).

## Entra App Registration (SPA)

1. Register a Single-Page Application. Add a redirect URI matching
   `VITE_ENTRA_REDIRECT_URI` (e.g. `https://your-app/auth/callback`).
2. Expose the backend API as an application ID URI with a delegated scope (e.g.
   `access_as_user`); set `VITE_ENTRA_API_SCOPE` to
   `api://<backend-app-id>/access_as_user`.
3. Grant the SPA delegated permission to that scope.
4. Set `VITE_ENTRA_CLIENT_ID` (the SPA app id) and `VITE_ENTRA_TENANT_ID`.
5. Ensure the backend's `ENTRA_AUDIENCE`/`ENTRA_ISSUER` match this tenant so it
   validates the tokens the SPA sends.

These are all **public identifiers**. There is no client secret in the browser.

## How tokens flow

- MSAL caches tokens in `sessionStorage`.
- The API client requests headers from a registered `TokenProvider`; in Entra
  mode it calls `acquireTokenSilent` for the API scope and attaches
  `Authorization: Bearer …`. Components never see tokens.
- On `interaction_required` / `consent_required`, MSAL falls back to a redirect.
- On a backend `401`, the provider triggers interactive re-auth; the UI shows
  "Your session has expired. Sign in again to continue."

## CORS

The backend must allow the dashboard origin. For local dev the backend default
`CORS_ALLOWED_ORIGINS=http://localhost:5173` matches the Vite dev server.
