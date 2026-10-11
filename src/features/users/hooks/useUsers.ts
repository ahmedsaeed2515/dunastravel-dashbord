import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { UserQueryFilters } from "../types";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { UserFormValues, UpdateUserFormValues } from "../schemas/user.schema";
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
      toast.success("تم إنشاء حساب المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل إنشاء حساب المستخدم");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل حذف المستخدم");
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      usersApi.suspendUser(id, reason),
    onSuccess: (_, variables) => {
      toast.success("تم إيقاف حساب المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables.id) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل إيقاف حساب المستخدم");
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activateUser(id),
    onSuccess: (_, variables) => {
      toast.success("تم إعادة تفعيل حساب المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (variables) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل إعادة تفعيل حساب المستخدم");
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.revokeSessions(id),
    onSuccess: (_, id) => {
      toast.success("تم إنهاء كافة جلسات المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل إنهاء جلسات المستخدم");
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
      toast.success("تم إضافة الملاحظة بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables.id) });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل إضافة الملاحظة");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormValues | UpdateUserFormValues> }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success("تم تحديث بيانات وصلاحيات المستخدم بنجاح");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.monitoringOverview() });
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "فشل تحديث بيانات المستخدم");
    },
  });
}
