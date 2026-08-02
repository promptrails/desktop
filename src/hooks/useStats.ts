import { useQuery } from "@tanstack/react-query";
import { getClient } from "../lib/api";

/**
 * API v2: the `/dashboard/metrics` endpoint is gone. Overview stats now come
 * from trace aggregation (`/traces/summary`), scoped by a `date_from` window.
 */
export function useTraceSummary(days: number = 7) {
  return useQuery({
    queryKey: ["trace-summary", days],
    queryFn: async () => {
      const client = getClient();
      const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      return client.traces.getSummary({ date_from: dateFrom });
    },
    refetchInterval: 30000,
  });
}
