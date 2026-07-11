# API client & OpenAPI generation

## Current approach: Zod contracts (temporary, documented)

The backend (NestJS + `@nestjs/swagger`) serves interactive docs at
`/api/docs` when `SWAGGER_ENABLED=true`, but does **not** commit an
`openapi.json`. Rather than depend on a running server to generate types, the
frontend defines Zod schemas in `src/api/contracts/schemas.ts` that mirror the
backend DTOs, and validates every response at the boundary
(`src/api/client/http-client.ts`).

Benefits: contract drift surfaces as one clear `ApiError('parse')` instead of
`undefined` deep in a component; enums are narrowed with safe fallbacks in
`src/api/mappers`.

## Moving to generated types (when a spec is published)

1. Export the spec from the backend, e.g.:
   ```bash
   # from B12CodeReviewerBackend, with the app running and SWAGGER_ENABLED=true
   curl http://localhost:3000/api/docs-json > ../openapi.json
   ```
   (or add a backend script that writes the `SwaggerModule` document to a file).
2. Generate types, e.g. with `openapi-typescript`:
   ```bash
   pnpm dlx openapi-typescript ../openapi.json -o src/api/generated/schema.d.ts
   ```
3. Replace the hand-written contract types with the generated ones, keeping the
   Zod schemas (or `zod`-from-openapi) for runtime validation, and keep the
   mappers as the single DTO→view-model layer.

Keep the mapping layer regardless of codegen: components consume view models,
never raw wire shapes.

## Endpoints integrated

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/azure-devops/connections` | List connections |
| POST | `/azure-devops/connections` | Create connection |
| POST | `/azure-devops/connections/:id/test` | Test connection |
| DELETE | `/azure-devops/connections/:id` | Remove connection |
| GET | `.../:id/projects` | List projects |
| GET | `.../projects/:projectId/repositories` | List repositories |
| GET | `.../repositories/:repositoryId/pull-requests` | List active PRs |
| GET | `.../pull-requests/:pullRequestId` | Get a PR |
| POST | `/reviews/estimate` | Estimate size/cost (no model call) |
| POST | `/reviews` | Start a review |
| GET | `/reviews` | List reviews (paginated) |
| GET | `/reviews/:reviewId` | Get review + findings |
| POST | `/reviews/:reviewId/cancel` | Cancel a review |
| POST | `/reviews/:reviewId/publish` | Publish selected findings/summary |
