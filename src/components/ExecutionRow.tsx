import { useNavigate } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { formatDuration, formatCost, timeAgo } from "../lib/utils";

interface ExecutionRowProps {
  execution: {
    id: string;
    status: string;
    cost: number;
    duration_ms?: number;
    created_at: string;
    metadata: Record<string, unknown>;
  };
}

export function ExecutionRow({ execution }: ExecutionRowProps) {
  const navigate = useNavigate();
  const agentName = (execution.metadata?.agent_name as string) || "Agent";

  return (
    <button
      onClick={() => navigate(`/executions/${execution.id}`)}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{agentName}</span>
          <StatusBadge status={execution.status} />
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDuration(execution.duration_ms)}</span>
          <span>{formatCost(execution.cost)}</span>
          <span>{timeAgo(execution.created_at)}</span>
        </div>
      </div>
      <svg
        className="h-4 w-4 shrink-0 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
