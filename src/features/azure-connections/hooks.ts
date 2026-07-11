import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/client/endpoints';
import { queryKeys } from '@/api/query-keys';
import { toConnectionVM } from '@/api/mappers';
import type { CreateConnectionRequest } from '@/api/contracts/requests';
import type { ConnectionVM } from '@/types/view-models';

/** List the current user's Azure DevOps connections (§9 step 1). */
export function useConnections() {
  return useQuery({
    queryKey: queryKeys.connections(),
    queryFn: async ({ signal }): Promise<ConnectionVM[]> => {
      const wire = await api.listConnections(signal);
      return wire.map(toConnectionVM);
    },
  });
}

export function useCreateConnection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConnectionRequest) => api.createConnection(input),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.connections() }),
  });
}

/** Test a connection. Returns the raw ok flag; never retried automatically. */
export function useTestConnection() {
  return useMutation({
    mutationFn: (id: string) => api.testConnection(id),
  });
}

export function useDeleteConnection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteConnection(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.connections() }),
  });
}
