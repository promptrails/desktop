import type { AgentExecution } from "@promptrails/sdk";
import { useState } from "react";
import { useDecideApproval } from "../hooks/useApprovals";
import { timeAgo } from "../lib/utils";
import { StatusBadge } from "./StatusBadge";

interface ApprovalCardProps {
  execution: AgentExecution;
}

export function ApprovalCard({ execution }: ApprovalCardProps) {
  const [reason, setReason] = useState("");
  const decide = useDecideApproval();

  const agentName = (execution.metadata?.agent_name as string) || "Agent";
  const isPending = execution.status === "waiting_approval";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{agentName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {timeAgo(execution.created_at)}
          </p>
        </div>
        <StatusBadge status={execution.status} />
      </div>

      {execution.approval_expires_at && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          Expires {timeAgo(execution.approval_expires_at)}
        </p>
      )}

      {execution.input && Object.keys(execution.input).length > 0 && (
        <pre className="mt-3 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(execution.input, null, 2)}
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
                  id: execution.id,
                  decision: "approve",
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
                  id: execution.id,
                  decision: "deny",
                  reason: reason || undefined,
                })
              }
              disabled={decide.isPending}
              className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              Deny
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
