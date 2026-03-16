import { useQuery } from "@tanstack/react-query";
import { getClient } from "../lib/api";

export function useTraces(traceId: string | undefined) {
  return useQuery({
    queryKey: ["traces", traceId],
    queryFn: async () => {
      const client = getClient();
      return client.traces.getByTraceId(traceId!);
    },
    enabled: !!traceId,
  });
}
