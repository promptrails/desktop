import { useState } from "react";
import { formatDuration, formatCost, formatTokens, cn } from "../lib/utils";
import { ChevronRight, ChevronDown } from "lucide-react";

interface TraceSpanProps {
  trace: {
    name: string;
    kind: string;
    status: string;
    duration_ms?: number;
    cost?: number;
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    error_message: string;
    input?: Record<string, unknown>;
    output?: Record<string, unknown>;
  };
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
}

const kindColors: Record<string, string> = {
  llm: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  tool: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  chain: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  agent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  retrieval: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

export function TraceSpan({
  trace,
  depth,
  hasChildren,
  expanded,
  onToggle,
}: TraceSpanProps) {
  const [showDetail, setShowDetail] = useState(false);
  const kindClass =
    kindColors[trace.kind] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div>
      <button
        onClick={hasChildren ? onToggle : () => setShowDetail(!showDetail)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent/50"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5" />
        )}

        <span className="min-w-0 flex-1 truncate text-sm">{trace.name}</span>

        <span
          className={cn(
            "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
            kindClass,
          )}
        >
          {trace.kind}
        </span>

        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDuration(trace.duration_ms)}
        </span>

        {trace.cost ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatCost(trace.cost)}
          </span>
        ) : null}

        {trace.total_tokens ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatTokens(trace.total_tokens)}t
          </span>
        ) : null}

        {trace.error_message && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
        )}
      </button>

      {showDetail && (
        <div
          className="border-t border-border bg-muted/30 px-4 py-3"
          style={{ marginLeft: `${depth * 20 + 12}px` }}
        >
          {trace.error_message && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-red-500">Error</p>
              <pre className="overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {trace.error_message}
              </pre>
            </div>
          )}
          {trace.input && Object.keys(trace.input).length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Input</p>
              <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(trace.input, null, 2)}
              </pre>
            </div>
          )}
          {trace.output && Object.keys(trace.output).length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Output</p>
              <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(trace.output, null, 2)}
              </pre>
            </div>
          )}
          {trace.prompt_tokens != null && (
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Prompt: {formatTokens(trace.prompt_tokens)}</span>
              <span>Completion: {formatTokens(trace.completion_tokens)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
