import { useParams, useNavigate } from "react-router-dom";
import { useExecution } from "../hooks/useExecutions";
import { useTraces } from "../hooks/useTraces";
import { StatusBadge } from "../components/StatusBadge";
import { TraceTree } from "../components/TraceTree";
import { formatDuration, formatCost, formatTokens } from "../lib/utils";
import { ArrowLeft } from "lucide-react";

export default function ExecutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: execution, isLoading } = useExecution(id!);
  const { data: traces, isLoading: tracesLoading } = useTraces(execution?.trace_id);

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

        {/* Trace Tree */}
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Trace</p>
          {tracesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : traces ? (
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
