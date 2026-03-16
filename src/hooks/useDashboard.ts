import { useQuery } from "@tanstack/react-query";
import { getClient } from "../lib/api";

export function useDashboardMetrics(days: number = 7) {
  return useQuery({
    queryKey: ["dashboard", days],
    queryFn: async () => {
      const client = getClient();
      return client.dashboard.getMetrics({ days });
    },
    refetchInterval: 30000,
  });
}
