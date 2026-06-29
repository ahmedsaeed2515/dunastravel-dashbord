"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth";

export function usePermissions() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  const role = user?.role; // 'ADMIN' | 'USER' | 'GUEST'
  // Future: Parse fine-grained permissions array if backend provides them
  // const permissions = user?.permissions || [];

  const hasPermission = (action: string, resource: string) => {
    if (!role) return false;
    
    // SuperAdmin rule
    if (role === 'ADMIN') return true;

    // TODO: Implement actual resource-based matrix mapping here
    return false;
  };

  return {
    user,
    role,
    isLoading,
    hasPermission,
    isAdmin: role === 'ADMIN',
  };
}
