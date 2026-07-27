import { invoke } from "@tauri-apps/api/core";
import { Activity, CheckCircle, DollarSign, ExternalLink, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { PeriodTabs } from "../components/PeriodTabs";
import { useApprovals } from "../hooks/useApprovals";
import { useTraceSummary } from "../hooks/useStats";
import { initClient, isClientReady } from "../lib/api";
import { formatCost, formatDuration, formatTokens } from "../lib/utils";
import { getApiKey, getApiUrl } from "../stores/auth";

function TrayPanelContent() {
  const [days, setDays] = useState(1);
  const { data: summary } = useTraceSummary(days);
  const { data: appData } = useApprovals();

  const pendingCount = appData?.pages?.[0]?.meta?.total || 0;
  const totalTraces = summary?.total_traces || 0;
  const errorCount = summary?.error_count || 0;
  const totalCost = summary?.total_cost || 0;
  const successRate =
    totalTraces > 0 ? (((totalTraces - errorCount) / totalTraces) * 100).toFixed(0) : "-";

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
          <span className="mt-1 text-base font-bold">{totalTraces}</span>
          <span className="text-[8px] text-muted-foreground">Traces</span>
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
      {summary && (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3 text-[10px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Avg Duration</span>
            <span className="font-medium text-foreground">
              {formatDuration(summary.avg_duration_ms)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tokens</span>
            <span className="font-medium text-foreground">
              {formatTokens(summary.total_tokens)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Errors</span>
            <span className="font-medium text-red-500">{errorCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Models</span>
            <span className="font-medium text-foreground">{summary.unique_models}</span>
          </div>
          <div className="flex justify-between">
            <span>Sessions</span>
            <span className="font-medium text-foreground">{summary.unique_sessions}</span>
          </div>
        </div>
      )}

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
