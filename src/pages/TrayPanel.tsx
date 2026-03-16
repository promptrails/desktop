import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getApiKey, getApiUrl } from "../stores/auth";
import { initClient, isClientReady } from "../lib/api";
import { useExecutions } from "../hooks/useExecutions";
import { useApprovals } from "../hooks/useApprovals";
import { StatusBadge } from "../components/StatusBadge";
import { formatDuration, formatCost, timeAgo } from "../lib/utils";
import {
  Activity,
  Shield,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

function TrayPanelContent() {
  const { data: execData } = useExecutions();
  const { data: appData } = useApprovals("pending");

  const firstExecPage = execData?.pages?.[0];
  const firstAppPage = appData?.pages?.[0];

  const recentExecutions = firstExecPage?.data?.slice(0, 5) || [];
  const pendingCount = firstAppPage?.meta?.total || 0;

  const allExecs = firstExecPage?.data || [];
  const totalExecs = firstExecPage?.meta?.total || 0;
  const failedCount = allExecs.filter(
    (e: { status: string }) => e.status === "failed",
  ).length;
  const runningCount = allExecs.filter(
    (e: { status: string }) => e.status === "running",
  ).length;

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold">PromptRails Monitor</span>
        </div>
        <button
          onClick={() => invoke("open_main_window")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-primary transition-colors hover:bg-accent"
        >
          Open App
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
        <div className="flex flex-col items-center bg-card py-2.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Activity className="h-3 w-3" />
          </div>
          <span className="mt-1 text-lg font-bold">{totalExecs}</span>
          <span className="text-[9px] text-muted-foreground">Executions</span>
        </div>
        <div className="flex flex-col items-center bg-card py-2.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="h-3 w-3" />
          </div>
          <span className="mt-1 text-lg font-bold text-amber-600">{pendingCount}</span>
          <span className="text-[9px] text-muted-foreground">Pending</span>
        </div>
        <div className="flex flex-col items-center bg-card py-2.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <XCircle className="h-3 w-3" />
          </div>
          <span className="mt-1 text-lg font-bold text-red-500">{failedCount}</span>
          <span className="text-[9px] text-muted-foreground">Failed</span>
        </div>
      </div>

      {/* Running indicator */}
      {runningCount > 0 && (
        <div className="flex items-center gap-2 border-b border-border bg-blue-50 px-4 py-2 dark:bg-blue-950/30">
          <Clock className="h-3 w-3 animate-spin text-blue-500" />
          <span className="text-xs text-blue-700 dark:text-blue-400">
            {runningCount} execution{runningCount > 1 ? "s" : ""} running
          </span>
        </div>
      )}

      {/* Pending approvals alert */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 border-b border-border bg-amber-50 px-4 py-2 dark:bg-amber-950/30">
          <Shield className="h-3 w-3 text-amber-500" />
          <span className="text-xs text-amber-700 dark:text-amber-400">
            {pendingCount} approval{pendingCount > 1 ? "s" : ""} waiting
          </span>
          <button
            onClick={() => invoke("open_main_window")}
            className="ml-auto text-[10px] font-medium text-amber-600 hover:underline"
          >
            Review
          </button>
        </div>
      )}

      {/* Recent executions */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 pb-1 pt-3 text-[10px] font-medium uppercase text-muted-foreground">
          Recent
        </p>
        {recentExecutions.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No recent executions
          </p>
        ) : (
          recentExecutions.map(
            (exec: {
              id: string;
              status: string;
              duration_ms?: number;
              cost: number;
              created_at: string;
              metadata: Record<string, unknown>;
            }) => (
              <div
                key={exec.id}
                className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-accent/30"
              >
                {exec.status === "completed" ? (
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : exec.status === "failed" ? (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <StatusBadge status={exec.status} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {(exec.metadata?.agent_name as string) || "Agent"}
                  </p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>{formatDuration(exec.duration_ms)}</span>
                    <span>{formatCost(exec.cost)}</span>
                    <span>{timeAgo(exec.created_at)}</span>
                  </div>
                </div>
              </div>
            ),
          )
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2">
        <button
          onClick={() => invoke("open_main_window")}
          className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Open Monitor
        </button>
      </div>
    </div>
  );
}

export default function TrayPanel() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      if (isClientReady()) {
        setReady(true);
        return;
      }
      const apiKey = await getApiKey();
      const apiUrl = await getApiUrl();
      if (apiKey) {
        initClient(apiKey, apiUrl);
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-xs text-muted-foreground">Not connected</p>
      </div>
    );
  }

  return <TrayPanelContent />;
}
