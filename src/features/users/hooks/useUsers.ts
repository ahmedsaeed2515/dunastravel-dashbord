/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";
import { UserQueryFilters } from "../types";
import { toast } from "sonner";
import { UserFormValues } from "../schemas/user.schema";

export function useUsers(filters: UserQueryFilters) {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.getUsers(filters),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserFormValues) => usersApi.createUser(data),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to create user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete user");
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => usersApi.suspendUser(id, reason),
    onSuccess: (_, variables) => {
      toast.success("User suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to suspend user");
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activateUser(id),
    onSuccess: (_, variables) => {
      toast.success("User activated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to activate user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormValues> }) => usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update user");
    },
  });
}
