"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, LoginPayload } from "../api/auth";
import { queryKeys } from "@/lib/query-keys";
import { UserSession } from "@/lib/api-types";

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserSession>({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getMe,
    staleTime: 5 * 60 * 1000, // Cache session for 5 minutes
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginPayload) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.me(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();
    },
    onError: () => {
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();
    },
  });

  return {
    user: user || null,
    role: user?.role,
    isAuthenticated: Boolean(user && user.id),
    isLoading,
    isError,
    error,
    refetchSession: refetch,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
