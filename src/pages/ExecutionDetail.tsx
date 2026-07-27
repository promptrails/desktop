import type { AgentExecution } from "@promptrails/sdk";
import { ArrowLeft, CornerDownRight, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { TraceTree } from "../components/TraceTree";
import { useCancelExecution, useExecutionTree } from "../hooks/useExecutions";
import { useTraces } from "../hooks/useTraces";
import { formatCost, formatDuration, formatTokens } from "../lib/utils";

const CANCELABLE = new Set(["running", "pending", "waiting_approval"]);

function ExecutionNode({
  node,
  depth,
  onSelect,
}: {
  node: AgentExecution;
  depth: number;
  onSelect: (id: string) => void;
}) {
  const agentName = (node.metadata?.agent_name as string) || "Agent";
  return (
    <div>
      <button
        onClick={() => onSelect(node.id)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/50"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {depth > 0 && (
          <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-sm">{agentName}</span>
        <StatusBadge status={node.status} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDuration(node.duration_ms)}
        </span>
        {node.cost ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatCost(node.cost)}
          </span>
        ) : null}
      </button>
      {node.children?.map((child) => (
        <ExecutionNode
          key={child.id}
          node={child}
          depth={depth + 1}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function ExecutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: execution, isLoading } = useExecutionTree(id!);
  const { data: traces, isLoading: tracesLoading } = useTraces(execution?.trace_id);
  const cancel = useCancelExecution();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!execution) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Execution not found
      </p>
    );
  }

  const tokenUsage = execution.token_usage as Record<string, number> | undefined;
  const totalTokens = tokenUsage?.total_tokens || tokenUsage?.total || 0;
  const canCancel = CANCELABLE.has(execution.status);
  const hasChildren = (execution.children?.length ?? 0) > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded p-1 transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold">Execution Detail</h1>
        {canCancel && (
          <button
            onClick={() => cancel.mutate(execution.id)}
            disabled={cancel.isPending}
            className="ml-auto flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="h-3 w-3" />
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Summary */}
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={execution.status} />
            <span className="text-xs text-muted-foreground">{execution.id}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">
                {formatDuration(execution.duration_ms)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Cost</p>
              <p className="text-sm font-medium">{formatCost(execution.cost)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Tokens</p>
              <p className="text-sm font-medium">{formatTokens(totalTokens)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {new Date(execution.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {execution.error && (
            <div className="mt-3">
              <p className="text-[10px] uppercase text-red-500">Error</p>
              <pre className="mt-1 overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {execution.error}
              </pre>
            </div>
          )}
        </div>

        {/* Input/Output */}
        {execution.input && Object.keys(execution.input).length > 0 && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Input</p>
            <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(execution.input, null, 2)}
            </pre>
          </div>
        )}

        {execution.output && Object.keys(execution.output).length > 0 && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Output</p>
            <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>
        )}

        {/* Execution tree (sub-agents / handoffs / workflow nodes) */}
        {hasChildren && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Sub-executions
            </p>
            <div className="divide-y divide-border rounded-lg border border-border">
              <ExecutionNode
                node={execution}
                depth={0}
                onSelect={(execId) => navigate(`/executions/${execId}`)}
              />
            </div>
          </div>
        )}

        {/* Trace spans */}
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Trace</p>
          {tracesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : traces && traces.length > 0 ? (
            <TraceTree traces={traces} />
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No trace data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
