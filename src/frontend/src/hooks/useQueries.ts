import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Report } from "../backend.d";
import { useActor } from "./useActor";

export function useGetReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      department: string;
      city: string;
      corruptionType: string;
      amount: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitReport(
        data.department,
        data.city,
        data.corruptionType,
        data.amount,
        data.description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function formatAmount(amount: bigint): string {
  return Number(amount).toLocaleString("en-IN");
}

export function relativeTime(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString("en-IN");
}
