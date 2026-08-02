import type { AgentExecution } from "@promptrails/sdk";
import { ApprovalCard } from "../components/ApprovalCard";
import { useApprovals } from "../hooks/useApprovals";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

export default function Approvals() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useApprovals();

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const executions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Approvals</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Executions waiting on a human decision
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <p className="py-8 text-center text-sm text-red-500">
            Failed to load approvals
          </p>
        )}

        {!isLoading && executions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No executions waiting for approval
          </p>
        )}

        <div className="space-y-3">
          {executions.map((execution: AgentExecution) => (
            <ApprovalCard key={execution.id} execution={execution} />
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
