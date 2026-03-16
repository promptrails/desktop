import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "../lib/utils";
import { useDecideApproval } from "../hooks/useApprovals";

interface ApprovalCardProps {
  approval: {
    id: string;
    execution_id: string;
    checkpoint_name: string;
    payload: Record<string, unknown>;
    status: string;
    reason?: string;
    created_at: string;
  };
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const [reason, setReason] = useState("");
  const decide = useDecideApproval();

  const isPending = approval.status === "pending";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{approval.checkpoint_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {timeAgo(approval.created_at)}
          </p>
        </div>
        <StatusBadge status={approval.status} />
      </div>

      {approval.payload && Object.keys(approval.payload).length > 0 && (
        <pre className="mt-3 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(approval.payload, null, 2)}
        </pre>
      )}

      {isPending && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button
              onClick={() =>
                decide.mutate({
                  id: approval.id,
                  decision: "approved",
                  reason: reason || undefined,
                })
              }
              disabled={decide.isPending}
              className="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() =>
                decide.mutate({
                  id: approval.id,
                  decision: "rejected",
                  reason: reason || undefined,
                })
              }
              disabled={decide.isPending}
              className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {approval.reason && (
        <p className="mt-2 text-xs text-muted-foreground">Reason: {approval.reason}</p>
      )}
    </div>
  );
}
