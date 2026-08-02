import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getClient } from "../lib/api";
import { usePollingInterval } from "./useSettings";

const PAGE_SIZE = 20;

export function useExecutions(params?: { status?: string; agent_id?: string }) {
  const pollingInterval = usePollingInterval();

  return useInfiniteQuery({
    queryKey: ["executions", params],
    queryFn: async ({ pageParam = 1 }) => {
      const client = getClient();
      return client.executions.list({
        page: pageParam,
        limit: PAGE_SIZE,
        ...params,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    refetchInterval: pollingInterval,
  });
}

export function useExecution(id: string) {
  return useQuery({
    queryKey: ["execution", id],
    queryFn: async () => {
      const client = getClient();
      return client.executions.get(id);
    },
    enabled: !!id,
  });
}

/** Fetch an execution with its full `children` tree populated (API v2). */
export function useExecutionTree(id: string) {
  return useQuery({
    queryKey: ["execution-tree", id],
    queryFn: async () => {
      const client = getClient();
      return client.executions.tree(id);
    },
    enabled: !!id,
  });
}

/** Request cooperative cancellation of a running execution (API v2). */
export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const client = getClient();
      return client.executions.cancel(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["execution", id] });
      queryClient.invalidateQueries({ queryKey: ["execution-tree", id] });
      queryClient.invalidateQueries({ queryKey: ["executions"] });
    },
  });
}
