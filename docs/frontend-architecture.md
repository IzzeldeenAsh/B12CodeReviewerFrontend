# Frontend architecture

## Layering

```
pages / feature components   (src/features/**, src/components/**)
        │  props in, callbacks out
        ▼
feature hooks / view models  (src/features/*/hooks.ts, TanStack Query)
        │  typed calls
        ▼
typed API client             (src/api/client/*, contracts, mappers, errors)
        │  fetch + bearer + correlation id + Zod + Problem Details
        ▼
backend REST API             (B12CodeReviewerBackend, /api/v1)
```

Visual components never construct URLs, read tokens, call `fetch`, map raw Azure
DTOs, or hold review/publish policy.

## Key decisions

- **Zod contracts instead of OpenAPI codegen.** The backend exposes Swagger UI
  but no committed `openapi.json`. Validating each response against a Zod schema
  at the boundary turns contract drift into one clear error instead of
  `undefined` deep in a component. If a spec is published later, the contracts
  can be regenerated. See [openapi-client.md](./openapi-client.md).
- **Single API boundary** (`http-client.ts` + `endpoints.ts`). One place adds the
  bearer token (from a registered `TokenProvider`, so components never touch
  tokens), the `X-Correlation-Id`, cancellation, and RFC 7807 parsing.
- **View models** (`src/api/mappers`) decouple presentation from wire shapes and
  narrow enums with safe fallbacks (an unknown backend value degrades instead of
  crashing).
- **Server vs local state.** TanStack Query owns server state (keys centralized
  in `query-keys.ts`). Local UI state is component state. Cross-cutting UI uses
  small contexts: theme (`ColorModeProvider`), toast, auth. No Redux.
- **Auth strategy switch.** `AuthProvider` picks Entra (MSAL) or the isolated
  test provider from validated env at the composition root; the rest of the app
  depends only on `useAuth()`.
- **Retry/polling policy.** Only transient reads retry; mutations never retry.
  Estimate and publish are mutations. Reviews poll only while active and stop at
  terminal states (and while the tab is hidden).
- **Route-level code splitting** via `React.lazy`; heavy chunks (MUI, MSAL,
  query) are separated in the Vite build.

## Directory map

- `src/app` — App/router/providers/queryClient/paths.
- `src/auth` — MSAL + test auth, token provider, ProtectedRoute, return-to.
- `src/api` — client (http + endpoints), contracts (zod), errors, mappers,
  query-keys.
- `src/config` — browser-safe env validation.
- `src/components` — layout, navigation, feedback, data-display (reusable).
- `src/features` — one folder per slice (hooks + components).
- `src/theme` — MUI theme, tokens, color mode.
- `src/types` — domain enums + view models.
- `src/utils` — pure helpers.
- `src/observability` — analytics no-op adapter.
- `src/mocks` — MSW handlers + fixtures.
- `src/test` — setup + render helper.

## Security posture

See [security rules](../.claude/rules/security.md) and
[authentication](./authentication.md). No secrets in the browser; all PR/AI
content is untrusted and rendered as escaped text; the browser talks only to the
backend.
