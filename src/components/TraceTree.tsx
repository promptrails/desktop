import { useState } from "react";
import { TraceSpan } from "./TraceSpan";

interface Trace {
  id: string;
  span_id: string;
  parent_span_id: string;
  name: string;
  kind: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  duration_ms?: number;
  cost?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  error_message: string;
  started_at: string;
}

interface TraceTreeProps {
  traces: Trace[];
}

interface TreeNode extends Trace {
  children: TreeNode[];
}

function buildTree(traces: Trace[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const trace of traces) {
    map.set(trace.span_id, { ...trace, children: [] });
  }

  for (const trace of traces) {
    const node = map.get(trace.span_id)!;
    if (trace.parent_span_id && map.has(trace.parent_span_id)) {
      map.get(trace.parent_span_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function TreeNodeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <div>
      <TraceSpan
        trace={node}
        depth={depth}
        hasChildren={node.children.length > 0}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
      {expanded &&
        node.children.map((child) => (
          <TreeNodeRow key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  );
}

export function TraceTree({ traces }: TraceTreeProps) {
  const tree = buildTree(traces);

  if (tree.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No trace data available
      </p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {tree.map((node) => (
        <TreeNodeRow key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
