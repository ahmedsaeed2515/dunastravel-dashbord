"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Role } from "@/lib/api-types";

export function usePermissions() {
  const { user, role: rawRole, isLoading } = useAuth();

  const role: Role | undefined = rawRole || user?.role || undefined;

  const isSuperAdmin = !isLoading && role === 'SUPER_ADMIN';
  const isAdmin = !isLoading && (role === 'ADMIN' || role === 'SUPER_ADMIN');
  const isAgent = !isLoading && role === 'AGENT';
  const isB2B = !isLoading && (role === 'COMPANY' || role === 'AGENT');

  const canManageRoles = isSuperAdmin;
  const canAccessAuditLogs = isSuperAdmin;
  const canManageAdmins = isSuperAdmin;
  const canAccessFullOperations = isAdmin;
  const canManageTours = isAdmin;
  const canManageUsers = isAdmin;
  const canManagePromotions = isAdmin;
  const canManageMedia = isAdmin;
  const canAccessFinance = isAdmin || isB2B;

  const hasPermission = (action: string, resource: string): boolean => {
    if (isLoading || !role) return false;
    if (isSuperAdmin) return true;

    if (isAdmin) {
      // Admin cannot manage roles or access system audit logs
      if (resource === 'roles' || resource === 'audit') return false;
      return true;
    }

    if (isB2B) {
      const allowedB2BResources = ['bookings', 'commissions', 'wallet', 'profile'];
      if (!allowedB2BResources.includes(resource)) return false;
      // AGENT/B2B can only read or create bookings
      if (resource === 'bookings') {
        return action === 'read' || action === 'create';
      }
      return action === 'read';
    }

    return false;
  };

  const canAccessRoute = (pathname: string): boolean => {
    if (isLoading || !role) return false;
    if (isSuperAdmin) return true;

    if (pathname.includes('/admin/settings/roles') || pathname.includes('/admin/audit')) {
      return isSuperAdmin;
    }

    if (isB2B) {
      const allowedPaths = [
        '/dashboard',
        '/admin/finance/commissions',
        '/admin/finance/wallet',
        '/admin/bookings',
      ];
      return allowedPaths.some((p) => pathname.includes(p));
    }

    if (isAdmin) {
      return true;
    }

    return false;
  };

  return {
    user,
    role: role as Role | undefined,
    isLoading,
    isSuperAdmin,
    isAdmin,
    isAgent,
    isB2B,
    canManageRoles,
    canAccessAuditLogs,
    canManageAdmins,
    canAccessFullOperations,
    canManageTours,
    canManageUsers,
    canManagePromotions,
    canManageMedia,
    canAccessFinance,
    hasPermission,
    canAccessRoute,
  };
}
