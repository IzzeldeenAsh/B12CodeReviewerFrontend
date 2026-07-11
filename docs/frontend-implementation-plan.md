# Frontend implementation plan

This records the plan followed to build the dashboard. Status reflects the
current state of the repo.

## Approach

1. Inspect the backend (`B12CodeReviewerBackend`) to derive the exact API
   contract (controllers + NestJS DTOs), auth model (Entra JWT + isolated test
   headers), error shape (RFC 7807), and enums. There is no committed
   `openapi.json`, so the frontend uses Zod contracts that mirror the DTOs
   (see [openapi-client.md](./openapi-client.md)).
2. Scaffold Vite + React + TS (strict) + pnpm with lint/format/test/build.
3. Build the app shell: theme (light/dark/system), providers, router with
   protected routes, and the auth boundary (MSAL + test mode).
4. Build the typed API client (bearer + correlation id + Problem Details +
   AbortController + Zod validation), contracts, mappers, and query keys.
5. Build shared components (loading/empty/error, dialogs, status/severity/
   recommendation, safe code viewer, cost summary, skipped-file table).
6. Build feature slices as vertical, working slices connected to MSW:
   connections → projects → repositories → pull requests → PR details →
   estimate → confirm → review progress → results → findings → publish → stale →
   history.
7. Tests: unit (pure logic), component + MSW integration, Playwright e2e.
8. Package: Dockerfile + Nginx. Docs + Claude Code config.

## Status

| Area | Status |
| --- | --- |
| Foundation, tooling, env validation | Done |
| Theme, layout, routing, auth boundary | Done |
| Typed API client, contracts, mappers, MSW | Done |
| Shared components | Done |
| Browsing slices (connections→PR detail) | Done |
| Review workflow (estimate→publish→stale→history) | Done |
| Unit + component + MSW tests | Done (40 tests) |
| Playwright e2e (full flow + invariants) | Done (1 spec) |
| Docker + Nginx | Done |
| Claude Code config (CLAUDE.md, rules, skills, agents, hooks) | Done |

## Known limitations / follow-ups

- Backend `ReviewDetail`/`ReviewSummary` DTOs do not include `connectionId` or a
  findings count. The review page reconstructs the "back to pull request" link
  from router state when available (set when a review is started) and otherwise
  links back to connections. A backend addition of `connectionId` would let
  history-originated reviews deep-link to the PR.
- The reviewed source commit is not exposed on the review DTO, so the publish
  preview targets the PR by id rather than a specific commit sha.
- Diff viewing is MVP: evidence and nearby lines from the backend, rendered
  safely. No repository file fetching (by design).
- OpenAPI codegen is not wired because the backend does not publish a committed
  spec; Zod contracts are the temporary, documented approach.
