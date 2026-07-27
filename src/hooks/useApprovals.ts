import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClient } from "../lib/api";
import { usePollingInterval } from "./useSettings";

const PAGE_SIZE = 20;

/**
 * API v2: approvals are execution-scoped. The inbox lists executions parked at
 * `waiting_approval` (an approval-gated tool call). There is no separate
 * approval object or approved/rejected history — once decided the execution
 * resumes and leaves the inbox.
 */
export function useApprovals() {
  const pollingInterval = usePollingInterval();

  return useInfiniteQuery({
    queryKey: ["approvals"],
    queryFn: async ({ pageParam = 1 }) => {
      const client = getClient();
      return client.executions.approvalInbox({
        page: pageParam,
        limit: PAGE_SIZE,
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

export function useDecideApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      decision,
      reason,
    }: {
      id: string;
      decision: "approve" | "deny";
      reason?: string;
    }) => {
      const client = getClient();
      return decision === "approve"
        ? client.executions.approve(id, { reason })
        : client.executions.deny(id, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["executions"] });
    },
  });
}
