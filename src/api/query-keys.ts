/**
 * Centralized TanStack Query key factory (§16). Every query/mutation references
 * keys from here so invalidation targets exactly the right caches and nothing
 * duplicates a hand-written array literal.
 */
export const queryKeys = {
  connections: () => ['connections'] as const,
  projects: (connectionId: string) => ['projects', connectionId] as const,
  repositories: (connectionId: string, projectId: string) =>
    ['repositories', connectionId, projectId] as const,
  pullRequests: (connectionId: string, projectId: string, repositoryId: string) =>
    ['pullRequests', connectionId, projectId, repositoryId] as const,
  pullRequest: (
    connectionId: string,
    projectId: string,
    repositoryId: string,
    pullRequestId: number,
  ) => ['pullRequest', connectionId, projectId, repositoryId, pullRequestId] as const,
  review: (reviewId: string) => ['review', reviewId] as const,
  reviewHistory: (filters: { page: number; pageSize: number; status?: string }) =>
    ['reviewHistory', filters] as const,
} as const;
