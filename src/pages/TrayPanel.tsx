import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getApiKey, getApiUrl } from "../stores/auth";
import { initClient, isClientReady } from "../lib/api";
import { useDashboardMetrics } from "../hooks/useDashboard";
import { useApprovals } from "../hooks/useApprovals";
import { PeriodTabs } from "../components/PeriodTabs";
import { StatusBadge } from "../components/StatusBadge";
import { formatDuration, formatCost, formatTokens } from "../lib/utils";
import { Activity, Shield, ExternalLink, CheckCircle, DollarSign } from "lucide-react";

function TrayPanelContent() {
  const [days, setDays] = useState(1);
  const { data: metrics } = useDashboardMetrics(days);
  const { data: appData } = useApprovals("pending");

  const pendingCount = appData?.pages?.[0]?.meta?.total || 0;
  const overview = metrics?.overview;
  const totalExecs = overview?.total_executions || 0;
  const errorCount = overview?.error_count || 0;
  const totalCost = overview?.total_cost || 0;
  const successRate =
    totalExecs > 0 ? (((totalExecs - errorCount) / totalExecs) * 100).toFixed(0) : "-";

  // Recent from agent_usage for a compact view
  const topAgents = metrics?.agent_usage?.slice(0, 3) || [];

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

      {/* Period tabs */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[10px] text-muted-foreground">Overview</span>
        <PeriodTabs value={days} onChange={setDays} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-px border-b border-border bg-border">
        <div className="flex flex-col items-center bg-card py-2.5">
          <Activity className="h-3 w-3 text-muted-foreground" />
          <span className="mt-1 text-base font-bold">{totalExecs}</span>
          <span className="text-[8px] text-muted-foreground">Execs</span>
        </div>
        <div className="flex flex-col items-center bg-card py-2.5">
          <CheckCircle className="h-3 w-3 text-muted-foreground" />
          <span className="mt-1 text-base font-bold">{successRate}%</span>
          <span className="text-[8px] text-muted-foreground">Success</span>
        </div>
        <div className="flex flex-col items-center bg-card py-2.5">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="mt-1 text-base font-bold">{formatCost(totalCost)}</span>
          <span className="text-[8px] text-muted-foreground">Cost</span>
        </div>
        <div className="flex flex-col items-center bg-card py-2.5">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <span className="mt-1 text-base font-bold text-amber-600">{pendingCount}</span>
          <span className="text-[8px] text-muted-foreground">Pending</span>
        </div>
      </div>

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

      {/* Extra metrics */}
      {overview && (
        <div className="flex gap-4 border-b border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span>
            Avg{" "}
            <span className="font-medium text-foreground">
              {formatDuration(overview.avg_duration_ms)}
            </span>
          </span>
          <span>
            Tokens{" "}
            <span className="font-medium text-foreground">
              {formatTokens(overview.total_tokens)}
            </span>
          </span>
          <span>
            Errors <span className="font-medium text-red-500">{errorCount}</span>
          </span>
        </div>
      )}

      {/* Top agents */}
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 pb-1 pt-3 text-[10px] font-medium uppercase text-muted-foreground">
          Top Agents
        </p>
        {topAgents.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No agent data
          </p>
        ) : (
          topAgents.map(
            (agent: {
              agent_id: string;
              agent_name: string;
              executions: number;
              total_cost: number;
            }) => (
              <div
                key={agent.agent_id}
                className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-accent/30"
              >
                <StatusBadge status="completed" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{agent.agent_name}</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>{agent.executions} runs</span>
                    <span>{formatCost(agent.total_cost)}</span>
                  </div>
                </div>
              </div>
            ),
          )
        )}

        {/* Recent errors */}
        {metrics?.error_rate && metrics.error_rate.length > 0 && (
          <>
            <p className="px-4 pb-1 pt-3 text-[10px] font-medium uppercase text-muted-foreground">
              Error Rate
            </p>
            {metrics.error_rate
              .slice(-3)
              .reverse()
              .map(
                (
                  day: {
                    date: string;
                    total: number;
                    errors: number;
                    error_rate: number;
                  },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-1.5 text-[10px]"
                  >
                    <span className="text-muted-foreground">{day.date.slice(5)}</span>
                    <span>
                      {day.errors}/{day.total}{" "}
                      <span
                        className={
                          day.error_rate > 10 ? "text-red-500" : "text-muted-foreground"
                        }
                      >
                        ({day.error_rate.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                ),
              )}
          </>
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
