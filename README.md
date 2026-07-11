# B12 AI Code Reviewer — Frontend

A React dashboard for **manual, human-in-the-loop** AI review of Azure DevOps
pull requests. The AI **recommends** (APPROVE / REQUEST_CHANGES / HUMAN_REVIEW)
and explains why; a human decides what to publish. The browser talks **only** to
the backend — never directly to Azure DevOps or Anthropic.

Backend lives in [`B12CodeReviewerBackend/`](./B12CodeReviewerBackend).

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:5173 — runs against Mock Service Worker + dev auth
```

Out of the box, `pnpm dev` uses `.env.development`, which enables an in-browser
mock API (MSW) and an isolated dev sign-in, so the whole app works **without a
backend, Entra tenant, or Anthropic key**.

## Commands

```bash
pnpm install         # install dependencies
pnpm dev             # start the dev server (MSW + dev auth by default)
pnpm lint            # ESLint
pnpm typecheck       # tsc --noEmit
pnpm test            # unit + component + MSW integration (Vitest)
pnpm test:coverage   # tests with coverage
pnpm test:e2e        # Playwright end-to-end (see note below)
pnpm build           # type-check project refs + production build
pnpm preview         # preview the production build
pnpm verify          # format:check + lint + typecheck + test + build
```

**Playwright**: on first run, install the browser once:
`pnpm exec playwright install chromium`. The E2E config starts the dev server in
MSW + test-auth mode automatically.

## Configuration

Every `VITE_`-prefixed variable is embedded in the browser bundle and is
therefore **public**. Never put a secret in one. See [`.env.example`](./.env.example).

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend REST base URL incl. `/api/v1`. |
| `VITE_AUTH_MODE` | `entra` (prod/staging) or `test` (dev/e2e only). |
| `VITE_ENTRA_CLIENT_ID` / `_TENANT_ID` / `_REDIRECT_URI` / `_API_SCOPE` | Public Entra identifiers (required when `entra`). |
| `VITE_ENABLE_MSW` | Serve requests from the in-browser mock (dev only). |
| `VITE_TEST_USER_*` | Identity for the isolated dev principal (`test` mode). |

- **Local dev**: `.env.development` (committed, no secrets) — MSW + dev auth.
- **Automated tests**: `.env.test` (committed, no secrets).
- **Production**: provide `VITE_AUTH_MODE=entra` and the Entra values as build
  args (see [`Dockerfile`](./Dockerfile)). A production build **refuses** to
  enable test auth or MSW.

Running against the real backend locally: set `VITE_ENABLE_MSW=false` and
`VITE_API_BASE_URL` to the backend, and ensure the backend `CORS_ALLOWED_ORIGINS`
includes `http://localhost:5173`.

## Documentation

- [docs/frontend-implementation-plan.md](./docs/frontend-implementation-plan.md)
- [docs/frontend-architecture.md](./docs/frontend-architecture.md)
- [docs/manual-review-flow.md](./docs/manual-review-flow.md)
- [docs/authentication.md](./docs/authentication.md)
- [docs/accessibility.md](./docs/accessibility.md)
- [docs/troubleshooting.md](./docs/troubleshooting.md)
- [docs/claude-code.md](./docs/claude-code.md)
- [docs/openapi-client.md](./docs/openapi-client.md)

## Product invariants (never regress)

- A review starts only after explicit user confirmation; nothing auto-starts.
- Selecting a PR or estimating never starts a review.
- Publishing is a separate explicit action; only user-selected findings post.
- No approve / reject / vote / merge / complete control exists.
- A stale review cannot be published; duplicate publish is prevented.
- No secret lives in browser code or a `VITE_` variable.

## Production packaging

`docker build` produces a static Nginx image (see `Dockerfile`, `nginx.conf`).
Adjust the CSP `connect-src` to your backend origin and Entra endpoints.
