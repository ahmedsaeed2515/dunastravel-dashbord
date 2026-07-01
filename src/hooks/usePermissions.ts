"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth";

export type Role = 'USER' | 'COMPANY' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';

export function usePermissions() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  const role = user?.role as Role | undefined;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isB2B = role === 'COMPANY' || role === 'AGENT';
  
  // Ensure we can render UI dynamically
  const canManageAdmins = isSuperAdmin;
  const canAccessFullOperations = isAdmin;

  return {
    user,
    role,
    isLoading,
    isSuperAdmin,
    isAdmin,
    isB2B,
    canManageAdmins,
    canAccessFullOperations
  };
}
