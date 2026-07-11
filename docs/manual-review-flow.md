# Manual review workflow

The dashboard enforces a strict human-in-the-loop workflow. Each step is an
explicit user action; nothing happens automatically.

1. **Select connection** — `/app/connections`. Cards show name, organization,
   base URL. Actions: Open, Test, Remove. Credentials are never shown.
2. **Select project** — projects for the connection, with search.
3. **Select repository** — repositories for the project, with default branch.
4. **Select pull request** — active PRs (table on desktop, cards on mobile) with
   search + author filter + refresh. **Opening a PR does not start a review.**
5. **View PR details** — title, description (escaped text), author, branches,
   abbreviated commits, status. Untrusted content is never rendered as HTML.
6. **Estimate review** — `POST /reviews/estimate`. Shows files, changed lines,
   input tokens, cost, skipped files, warnings, and whether it is within limits.
   **Estimating does not start a review.** Over-limit disables starting and
   explains why.
7. **Confirm review** — a dialog restates the PR, size, cost, and skips, and
   warns the review is advisory and nothing publishes automatically. The primary
   action is **Start AI review**; the secondary is **Cancel**.
8. **Track progress** — navigates to `/app/reviews/:reviewId` and polls while the
   review is DRAFT/QUEUED/FETCHING_PR/ANALYZING (with a stage label, start time,
   elapsed timer, and Cancel). Polling stops at COMPLETED/FAILED/CANCELLED/STALE.
9. **Read results** — recommendation (APPROVE / REQUEST_CHANGES / HUMAN_REVIEW)
   with icon + label + the advisory disclaimer, summary, model, tokens, cost,
   and a partial-review warning when applicable.
10. **Review findings** — grouped by severity or file, filterable by category /
    selection. Each finding shows severity, category, location, explanation,
    evidence, and suggested fix. **No finding is selected by default.**
11. **Publish** — a separate section. Choose summary and/or selected findings,
    open a preview (summary text, inline vs general counts, downgrades, target),
    then confirm. `POST /reviews/:id/publish` is called **only** from that
    confirmation. Published findings are disabled; duplicates are skipped.
12. **Stale handling** — a 409 stale review marks the UI stale, disables
    publishing, and offers navigation back to the PR to start a new review.
13. **History** — `/app/reviews` lists prior reviews with recommendation, status,
    partial/stale markers, and date; selecting one opens its details.

There is deliberately **no** approve, reject, vote, merge, or complete action in
the UI. The AI recommends; a human makes the final decision in Azure DevOps.
