# Troubleshooting

## The app shows "Invalid frontend environment configuration"

A required `VITE_*` variable is missing or malformed. In `entra` mode all four
`VITE_ENTRA_*` values are required. For local dev, copy `.env.example` to
`.env.local` or use the committed `.env.development` (MSW + dev auth).

## `pnpm dev` works but the real backend returns CORS errors

Set `VITE_ENABLE_MSW=false`, point `VITE_API_BASE_URL` at the backend, and make
sure the backend `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`.

## Sign-in loops or "session expired" immediately

- Entra: verify `VITE_ENTRA_CLIENT_ID/TENANT_ID/REDIRECT_URI/API_SCOPE` and that
  the redirect URI is registered as an SPA redirect. Confirm the backend
  `ENTRA_AUDIENCE`/`ENTRA_ISSUER` match the tenant issuing the token.
- Test mode: ensure `VITE_AUTH_MODE=test` and the backend is also in
  `AUTH_MODE=test` (it reads the `x-test-user-*` headers).

## `pnpm test:e2e` fails to launch a browser

Install the browser once: `pnpm exec playwright install chromium`. This is an
infrastructure step, not a test failure.

## Playwright can't find a button / clicks the wrong one

Accessible-name matching is substring by default. Use `{ exact: true }` when a
name is a prefix of another (e.g. the connection **"Open"** vs the header
**"Open account menu"**).

## Vitest picks up backend `*.spec.ts`

Vitest is scoped to `src/**/*.test.{ts,tsx}` and excludes
`B12CodeReviewerBackend`. Keep new frontend tests under `src/` with a `.test.`
suffix.

## A review never completes in local dev

The MSW mock advances a started review across a few polls
(QUEUED → FETCHING_PR → ANALYZING → COMPLETED). If you disabled MSW, a real
backend and job dispatcher are required.

## Build warns about chunks > 500 kB

Expected for the MUI/MSAL vendor chunks; they are split and lazy-loaded per
route. Tune `build.rollupOptions.output.manualChunks` in `vite.config.ts` if
needed.
