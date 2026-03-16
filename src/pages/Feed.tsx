import { useState } from "react";
import type { AgentExecution } from "@promptrails/sdk";
import { useExecutions } from "../hooks/useExecutions";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ExecutionRow } from "../components/ExecutionRow";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "completed", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "running", label: "Running" },
  { value: "awaiting_approval", label: "Awaiting Approval" },
];

export default function Feed() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useExecutions({
      status: statusFilter || undefined,
    });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const executions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Executions</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <p className="px-4 py-8 text-center text-sm text-red-500">
            Failed to load executions
          </p>
        )}

        {!isLoading && executions.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No executions found
          </p>
        )}

        {executions.map((execution: AgentExecution) => (
          <ExecutionRow key={execution.id} execution={execution} />
        ))}

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
