import { useState } from "react";
import type { ApprovalRequest } from "@promptrails/sdk";
import { useApprovals } from "../hooks/useApprovals";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ApprovalCard } from "../components/ApprovalCard";

const statusTabs = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function Approvals() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useApprovals(statusFilter);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const approvals = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Approvals</h1>
        <div className="mt-2 flex gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

        {!isLoading && approvals.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {statusFilter} approvals
          </p>
        )}

        <div className="space-y-3">
          {approvals.map((approval: ApprovalRequest) => (
            <ApprovalCard key={approval.id} approval={approval} />
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
