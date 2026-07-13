"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth";

export type Role = 'USER' | 'COMPANY' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN';

export function usePermissions() {
  const { data: userRaw, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  const user = userRaw?.data || userRaw;
  const role = user?.role as Role | undefined;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isB2B = role === 'COMPANY' || role === 'AGENT';
  
  // Ensure we can render UI dynamically
  const canManageAdmins = isSuperAdmin;
  const canAccessFullOperations = isAdmin;

  const hasPermission = (action: string, resource: string) => {
    if (isSuperAdmin) return true;
    if (isAdmin) {
      if (resource === 'roles' || resource === 'audit') return false;
      return true;
    }
    if (isB2B) {
      const allowedB2BResources = ['bookings', 'commissions', 'wallet'];
      return allowedB2BResources.includes(resource);
    }
    return false;
  };

  return {
    user,
    role,
    isLoading,
    isSuperAdmin,
    isAdmin,
    isB2B,
    canManageAdmins,
    canAccessFullOperations,
    hasPermission
  };
}
