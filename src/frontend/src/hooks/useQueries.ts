import type { ExternalBlob } from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Report } from "../backend.d";
import { useActor } from "./useActor";

export function useGetApprovedReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports", "approved"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports", "pending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).checkCallerIsAdmin() as Promise<boolean>;
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsAdminClaimed() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdminClaimed"],
    queryFn: async () => {
      if (!actor) return false;
      return (actor as any).isAdminClaimed() as Promise<boolean>;
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).claimAdmin() as Promise<boolean>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["isAdminClaimed"] });
    },
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
      officerName: string | null;
      photo: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createReport(
        data.department,
        data.city,
        data.corruptionType,
        data.amount,
        data.description,
        data.officerName,
        data.photo,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useApproveReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveReport(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useRejectReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectReport(id);
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
