import { useDashboardMetrics } from "../hooks/useDashboard";
import { StatCard } from "../components/StatCard";
import { formatCost, formatDuration, formatTokens } from "../lib/utils";
import { Activity, CheckCircle, DollarSign, Clock, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Stats() {
  const { data: metrics, isLoading, error } = useDashboardMetrics(7);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <p className="px-4 py-8 text-center text-sm text-red-500">Failed to load metrics</p>
    );
  }

  const overview = metrics.overview || {};
  const successRate =
    overview.total_executions > 0
      ? (
          ((overview.total_executions - (overview.error_count || 0)) /
            overview.total_executions) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Last 7 days</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Executions"
            value={String(overview.total_executions || 0)}
            icon={<Activity className="h-4 w-4" />}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="Total Cost"
            value={formatCost(overview.total_cost)}
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Duration"
            value={formatDuration(overview.avg_duration_ms)}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Executions by day chart */}
        {metrics.executions_by_day && metrics.executions_by_day.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Executions by Day
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={metrics.executions_by_day}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  labelFormatter={(v: string) => v}
                />
                <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top agents */}
        {metrics.agent_usage && metrics.agent_usage.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Top Agents</p>
            <div className="space-y-2">
              {metrics.agent_usage
                .slice(0, 5)
                .map(
                  (agent: {
                    agent_id: string;
                    agent_name: string;
                    executions: number;
                    total_cost: number;
                  }) => (
                    <div
                      key={agent.agent_id}
                      className="flex items-center justify-between rounded-md border border-border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{agent.agent_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agent.executions} executions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCost(agent.total_cost)}
                        </p>
                      </div>
                    </div>
                  ),
                )}
            </div>
          </div>
        )}

        {/* Token usage */}
        {overview.total_tokens > 0 && (
          <div className="mt-6">
            <StatCard
              title="Total Tokens"
              value={formatTokens(overview.total_tokens)}
              icon={<Zap className="h-4 w-4" />}
            />
          </div>
        )}
      </div>
    </div>
  );
}
