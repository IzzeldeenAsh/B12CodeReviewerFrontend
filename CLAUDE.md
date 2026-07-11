# CLAUDE.md — B12 AI Code Reviewer Frontend

Permanent conventions for this repository. Read before making changes.
Scoped rules live in `.claude/rules/`; deeper docs in `docs/`.

## What this is

A React dashboard for **manual, human-in-the-loop** AI review of Azure DevOps
pull requests. The AI **recommends** (APPROVE / REQUEST_CHANGES / HUMAN_REVIEW);
a human decides what to publish. The browser talks ONLY to the backend
(`B12CodeReviewerBackend/`), never directly to Azure DevOps or Anthropic.

**Non-negotiable product invariants** (never regress):

- A review starts ONLY from an explicit user confirmation. Nothing auto-starts.
- Selecting a PR or requesting an estimate NEVER starts a review.
- Publishing is a SEPARATE explicit action; only user-selected findings post.
- The UI has NO approve / reject / vote / merge / complete control.
- A stale review (409) cannot be published; duplicate publish is prevented.
- No secret ever lives in browser code or a `VITE_` variable.

## Stack & commands

React 18 · TypeScript (strict) · Vite 5 · pnpm · React Router 6 · TanStack
Query 5 · MSAL (`@azure/msal-*`) · MUI 6 · React Hook Form + Zod · Vitest +
Testing Library + MSW · Playwright.

```bash
pnpm install
pnpm dev            # runs against MSW + dev auth by default (no backend needed)
pnpm lint
pnpm typecheck
pnpm test           # unit + component + MSW integration
pnpm test:coverage
pnpm test:e2e       # Playwright (installs browsers on first run)
pnpm build
pnpm preview
pnpm verify         # format:check + lint + typecheck + test + build
```

Run `pnpm verify` (or `/verify-frontend`) before considering any task done.
`pnpm verify` intentionally excludes `test:e2e` (needs browser binaries); run it
separately.

## Folder structure

```
src/
  app/          App, providers, router, queryClient, paths
  auth/         MSAL + test-auth boundary, token provider, ProtectedRoute
  api/          client (http + endpoints), contracts (zod), errors, mappers, query-keys
  config/       env validation (browser-safe only)
  components/   layout · navigation · feedback · data-display (reusable, presentational)
  features/     one folder per slice: hooks.ts + page/section components
  theme/        MUI theme, tokens, ColorModeProvider
  types/        domain enums + view models
  utils/        pure helpers (format, safe-redirect)
  observability/analytics (no-op adapter)
  mocks/        MSW handlers + fixtures
  test/         setup + render helper
```

## Architecture boundaries

```
pages / feature components → feature hooks (TanStack Query) → typed API client → backend
```

Visual components must NOT: construct REST URLs, read access tokens, call
`fetch`, map raw Azure DTOs, or contain review/publish policy. Those live in
`api/` and `features/*/hooks.ts` and the pure logic modules
(`features/review-findings/selection.ts`). See `.claude/rules/frontend-architecture.md`.

## Server state (TanStack Query)

- Query keys come from `src/api/query-keys.ts` — never inline arrays.
- Only transient reads (network / 429 / 503) retry; mutations NEVER retry.
- Estimate and publish are **mutations** (user-triggered, no auto refetch).
- A review is polled only while active (DRAFT/QUEUED/FETCHING_PR/ANALYZING);
  polling stops at COMPLETED/FAILED/CANCELLED/STALE and while the tab is hidden.

## Authentication

- Entra ID via MSAL (Auth Code + PKCE), tokens in sessionStorage.
- The API client gets headers from a registered `TokenProvider` — components
  never touch tokens. Test mode sends isolated `x-test-user-*` headers and is
  forbidden in production builds by env validation. See `.claude/rules/authentication.md`.

## API integration

- Single boundary: `src/api/client/`. Bearer token + `X-Correlation-Id` added
  centrally; responses validated with Zod; RFC 7807 parsed to a typed `ApiError`.
- DTOs are mapped to view models in `src/api/mappers/` — never spread raw wire
  shapes through components. See `.claude/rules/api-integration.md`.

## TypeScript

`strict` on. No `any` (`no-explicit-any` is an error). No floating promises.
Prefer `import type`. `noUncheckedIndexedAccess` is on.

## Accessibility (WCAG 2.2 AA target)

Semantic landmarks, skip link, logical headings, visible focus, accessible
dialogs with focus restoration, `aria-live` for status/progress, non-color
status indicators, labelled tables. See `.claude/rules/accessibility.md`.

## Testing

- Unit-test pure logic (mappers, selection, formatters, errors, env, redirect).
- Component + MSW-integration tests use the `renderWithProviders` helper and the
  MSW server; never hit a real backend/Entra/Anthropic.
- Playwright covers the full manual flow and the invariants above.
  See `.claude/rules/testing.md`.

## Styling

MUI theme + tokens only; no hard-coded hex in components. Light/dark/system;
reduced-motion respected. See `.claude/rules/styling.md`.

## Security

No secrets in browser code or `VITE_` vars. No PATs/Anthropic keys in the
browser. No direct Azure DevOps / Anthropic calls. All PR/AI content is
untrusted: render as escaped text, never `dangerouslySetInnerHTML`; code/evidence
uses `SafeCodeBlock`. Validate redirects (`safeReturnTo`). Never log tokens.
See `.claude/rules/security.md`.

## Error handling

Every failure becomes a typed `ApiError`; user-facing copy comes from
`api/errors/messages.ts`. Never render raw backend detail, stack traces, or
tokens. Recoverable errors use `ErrorState` with retry.

## Hard prohibitions

- Do NOT edit real `.env` / `.env.local`. `*.example`, `.env.development`,
  `.env.test` are fine (they contain no secrets).
- Do NOT add a dependency without justifying why.
- Do NOT weaken the manual-review / manual-publish model or add a PR action.
- Do NOT claim a command passed without running it.
