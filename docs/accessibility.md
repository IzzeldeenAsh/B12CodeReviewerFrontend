# Accessibility

Target: **WCAG 2.2 AA** where practical. See
[`.claude/rules/accessibility.md`](../.claude/rules/accessibility.md) for the
enforced rules and `/accessibility-review` for the audit workflow.

## Implemented controls

- **Skip link** to `#main-content` and semantic landmarks (`banner`,
  `navigation`, `main`) in `AppLayout`.
- **Headings**: one `<h1>` per page via `PageHeader`; sections labelled.
- **Keyboard**: all controls operable; visible focus rings (theme); clickable
  table rows are focusable and respond to Enter.
- **Dialogs** (MUI): focus trap, Escape to close, focus restoration — used for
  every confirmation (start review, publish, remove connection).
- **Status/async**: `role="status"` + `aria-live="polite"` for loading and
  review progress; the progress stage description is the only live text, so only
  meaningful transitions are announced, not every poll. After a publish attempt,
  focus moves to the result alert.
- **Non-color signals**: status, severity, and recommendation always pair color
  with a label and icon (`StatusChip`, `SeverityBadge`, `RecommendationPanel`).
- **Tables**: `<th scope>` headers; wide tables scroll in a container; mobile
  falls back to cards so no information is hidden.
- **Code/evidence**: `SafeCodeBlock` renders escaped text with a labelled,
  scrollable region.
- **Reduced motion**: global `prefers-reduced-motion` handling in the theme.
- **Theming**: light, dark, and system, with contrast-conscious palettes.

## Verifying

Run `/accessibility-review` (or the read-only `accessibility-reviewer` subagent)
on major pages. Manual keyboard-only passes are covered by the Playwright flow
and can be extended with `@axe-core/playwright` if desired.
