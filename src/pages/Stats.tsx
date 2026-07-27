import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Layers,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { PeriodTabs } from "../components/PeriodTabs";
import { StatCard } from "../components/StatCard";
import { useTraceSummary } from "../hooks/useStats";
import { formatCost, formatDuration, formatTokens } from "../lib/utils";

export default function Stats() {
  const [days, setDays] = useState(7);
  const { data: summary, isLoading, error } = useTraceSummary(days);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <p className="px-4 py-8 text-center text-sm text-red-500">Failed to load stats</p>
    );
  }

  const successRate =
    summary.total_traces > 0
      ? (
          ((summary.total_traces - summary.error_count) / summary.total_traces) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Stats</h1>
        <PeriodTabs value={days} onChange={setDays} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Traces"
            value={String(summary.total_traces)}
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Total Cost"
            value={formatCost(summary.total_cost)}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Duration"
            value={formatDuration(summary.avg_duration_ms)}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Total Tokens"
            value={formatTokens(summary.total_tokens)}
            icon={<Zap className="h-4 w-4" />}
          />
          <StatCard
            title="Errors"
            value={String(summary.error_count)}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <StatCard
            title="Models"
            value={String(summary.unique_models)}
            icon={<Layers className="h-4 w-4" />}
          />
          <StatCard
            title="Sessions"
            value={String(summary.unique_sessions)}
            icon={<Users className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
