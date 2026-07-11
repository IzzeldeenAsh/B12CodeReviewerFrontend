# Claude Code configuration

Project-level Claude Code setup for this repo.

## Files

- **`CLAUDE.md`** (root) — permanent conventions loaded every session.
- **`.claude/rules/`** — path-scoped rules (frontmatter `globs`):
  - `frontend-architecture.md` → `src/components/**`, `src/features/**`, `src/app/**`
  - `api-integration.md` → `src/api/**`, `src/features/**/hooks.ts`
  - `authentication.md` → `src/auth/**`, `src/config/env.ts`
  - `accessibility.md` → `src/components/**`, `src/features/**`
  - `testing.md` → `**/*.test.ts(x)`, `src/test/**`, `src/mocks/**`, `e2e/**`
  - `styling.md` → theme + component files
  - `security.md` → project-wide
- **`.claude/skills/`** — `/verify-frontend`, `/implement-frontend-slice`,
  `/accessibility-review`, `/api-contract-check`, `/security-review`.
- **`.claude/agents/`** — `frontend-architect`, `ui-ux-reviewer`,
  `accessibility-reviewer` (read-only), `test-engineer`,
  `api-integration-specialist`.
- **`.claude/hooks/`** + **`.claude/settings.json`** — see below.

## Hooks

Deterministic, platform-neutral Node scripts wired in `.claude/settings.json`:

- **PreToolUse (`Edit|Write`) → `protect-files.mjs`**: blocks edits to real
  `.env`*, `.pem`/`.key`/`id_rsa`, `node_modules/`, `dist/`, `coverage/`, the
  generated MSW worker, and the backend folder. Allows `*.example`,
  `.env.development`, and `.env.test` (no secrets). Blocking exits code 2.
- **PostToolUse (`Edit|Write`) → `format-changed.mjs`**: formats the edited file
  with Prettier for supported extensions. Never fails an edit on formatting.

The hooks are intentionally conservative so ordinary development stays smooth.

## Recommended checkpoints

- After routing/API/feature boundaries → `frontend-architect`.
- After backend integration → `api-integration-specialist` / `/api-contract-check`.
- After the main workflow → `ui-ux-reviewer`.
- After major pages → `accessibility-reviewer` / `/accessibility-review`.
- After each vertical slice → `test-engineer`.
- Before completion → `/security-review`.
- Always before "done" → `/verify-frontend`.
