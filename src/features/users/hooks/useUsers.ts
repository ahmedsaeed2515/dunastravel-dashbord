import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { UserQueryFilters } from "../types";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { UserFormValues } from "../schemas/user.schema";
import { ApiError } from "@/lib/api-types";

export function useUsers(filters: UserQueryFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters as Record<string, unknown>),
    queryFn: () => usersApi.getUsers(filters),
  });
}

export function useUserMonitoringOverview() {
  return useQuery({
    queryKey: queryKeys.users.monitoringOverview(),
    queryFn: () => usersApi.getMonitoringOverview(),
    refetchInterval: 30000, // Live poll every 30s
  });
}

export function useUserMonitoringDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.users.monitoringDetail(id || ""),
    queryFn: () => usersApi.getUserMonitoringDetail(id!),
    enabled: Boolean(id),
  });
}

export function useLiveActivityStream(params?: {
  page?: number;
  limit?: number;
  category?: string;
  userId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.users.liveStream(params as Record<string, unknown>),
    queryFn: () => usersApi.getLiveActivityStream(params),
    refetchInterval: 15000, // Live polling every 15s
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserFormValues) => usersApi.createUser(data),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to create user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to delete user");
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      usersApi.suspendUser(id, reason),
    onSuccess: (_, variables) => {
      toast.success("User suspended successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to suspend user");
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activateUser(id),
    onSuccess: (_, variables) => {
      toast.success("User activated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to activate user");
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.revokeSessions(id),
    onSuccess: (_, id) => {
      toast.success("All user sessions revoked successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(id) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to revoke user sessions");
    },
  });
}

export function useAddUserMonitoringNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      content,
      noteType,
      isPinned,
    }: {
      id: string;
      content: string;
      noteType?: string;
      isPinned?: boolean;
    }) => usersApi.addUserNote(id, content, noteType, isPinned),
    onSuccess: (_, variables) => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables.id) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to add note");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormValues> }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to update user");
    },
  });
}
