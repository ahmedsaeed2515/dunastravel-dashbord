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
  const canManagePromotions = isSuperAdmin;
  const canManageMedia = isAdmin;
  const canAccessFinance = isAdmin;

  const hasPermission = (action: string, resource: string): boolean => {
    if (isLoading || !role) return false;
    if (isSuperAdmin) return true;

    if (isAdmin) {
      // Admin cannot manage roles or access system audit logs
      if (resource === 'roles' || resource === 'audit') return false;
      return true;
    }

    if (isB2B) {
      const allowedB2BResources = isAgent ? ['bookings', 'inquiries', 'profile'] : ['profile'];
      if (!allowedB2BResources.includes(resource)) return false;
      // Agents can only read bookings assigned to them by the backend.
      if (resource === 'bookings') {
        return isAgent && action === 'read';
      }
      if (resource === 'inquiries') {
        return isAgent && (action === 'read' || action === 'update');
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
      const allowedPaths = isAgent
        ? ['/admin/bookings', '/admin/inquiries', '/admin/profile']
        : ['/admin/profile'];
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
