import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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
      if (lastPage.meta.page < lastPage.meta.total_pages) {
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
