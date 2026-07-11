/**
 * Central route path builders. Both the router and every in-app link use these
 * so a path change happens in exactly one place.
 */
export const paths = {
  login: '/login',
  app: '/app',
  connections: '/app/connections',
  projects: (connectionId: string) => `/app/connections/${connectionId}/projects`,
  repositories: (connectionId: string, projectId: string) =>
    `/app/connections/${connectionId}/projects/${projectId}/repositories`,
  pullRequests: (connectionId: string, projectId: string, repositoryId: string) =>
    `/app/connections/${connectionId}/projects/${projectId}/repositories/${repositoryId}/pull-requests`,
  pullRequest: (
    connectionId: string,
    projectId: string,
    repositoryId: string,
    pullRequestId: number | string,
  ) =>
    `/app/connections/${connectionId}/projects/${projectId}/repositories/${repositoryId}/pull-requests/${pullRequestId}`,
  review: (reviewId: string) => `/app/reviews/${reviewId}`,
  reviews: '/app/reviews',
  settings: '/app/settings',
  unauthorized: '/app/unauthorized',
} as const;
