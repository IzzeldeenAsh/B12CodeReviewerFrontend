import { useQuery } from '@tanstack/react-query';
import * as api from '@/api/client/endpoints';
import { queryKeys } from '@/api/query-keys';
import { toProjectVM, toPullRequestVM, toRepositoryVM } from '@/api/mappers';
import type { ProjectVM, PullRequestVM, RepositoryVM } from '@/types/view-models';

/** Projects for a connection (§9 step 2). */
export function useProjects(connectionId: string) {
  return useQuery({
    queryKey: queryKeys.projects(connectionId),
    queryFn: async ({ signal }): Promise<ProjectVM[]> => {
      const wire = await api.listProjects(connectionId, signal);
      return wire.map(toProjectVM);
    },
  });
}

/** Repositories for a project (§9 step 3). */
export function useRepositories(connectionId: string, projectId: string) {
  return useQuery({
    queryKey: queryKeys.repositories(connectionId, projectId),
    queryFn: async ({ signal }): Promise<RepositoryVM[]> => {
      const wire = await api.listRepositories(connectionId, projectId, signal);
      return wire.map(toRepositoryVM);
    },
  });
}

/** Active pull requests for a repository (§9 step 4). */
export function usePullRequests(connectionId: string, projectId: string, repositoryId: string) {
  return useQuery({
    queryKey: queryKeys.pullRequests(connectionId, projectId, repositoryId),
    queryFn: async ({ signal }): Promise<PullRequestVM[]> => {
      const wire = await api.listPullRequests(connectionId, projectId, repositoryId, signal);
      return wire.map(toPullRequestVM);
    },
  });
}

/** A single pull request with metadata (§9 step 5). */
export function usePullRequest(
  connectionId: string,
  projectId: string,
  repositoryId: string,
  pullRequestId: number,
) {
  return useQuery({
    queryKey: queryKeys.pullRequest(connectionId, projectId, repositoryId, pullRequestId),
    queryFn: async ({ signal }): Promise<PullRequestVM> => {
      const wire = await api.getPullRequest(
        connectionId,
        projectId,
        repositoryId,
        pullRequestId,
        signal,
      );
      return toPullRequestVM(wire);
    },
  });
}
