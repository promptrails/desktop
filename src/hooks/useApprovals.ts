import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClient } from "../lib/api";
import { usePollingInterval } from "./useSettings";

const PAGE_SIZE = 20;

export function useApprovals(status?: string) {
  const pollingInterval = usePollingInterval();

  return useInfiniteQuery({
    queryKey: ["approvals", status],
    queryFn: async ({ pageParam = 1 }) => {
      const client = getClient();
      return client.approvals.list({
        page: pageParam,
        limit: PAGE_SIZE,
        status,
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

export function useDecideApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      decision,
      reason,
    }: {
      id: string;
      decision: "approved" | "rejected";
      reason?: string;
    }) => {
      const client = getClient();
      return client.approvals.decide(id, { decision, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["executions"] });
    },
  });
}
