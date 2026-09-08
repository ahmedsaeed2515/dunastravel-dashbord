"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Role } from '@/lib/api-types';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type PermissionResource =
  | 'dashboard'
  | 'bookings'
  | 'tours'
  | 'destinations'
  | 'hotels'
  | 'reviews'
  | 'promotions'
  | 'media'
  | 'finance'
  | 'commissions'
  | 'wallet'
  | 'customers'
  | 'companies'
  | 'agents'
  | 'inquiries'
  | 'communications'
  | 'content'
  | 'ai'
  | 'notifications'
  | 'audit'
  | 'settings'
  | 'roles'
  | 'profile';

const AGENT_RESOURCES: readonly PermissionResource[] = [
  'dashboard',
  'bookings',
  'inquiries',
  'communications',
  'profile',
];

const COMPANY_RESOURCES: readonly PermissionResource[] = [
  'dashboard',
  'bookings',
  'commissions',
  'wallet',
  'profile',
];

const ADMIN_RESTRICTED: readonly PermissionResource[] = ['audit', 'roles'];

export function hasServerAlignedPermission(
  role: Role | undefined,
  action: PermissionAction,
  resource: PermissionResource,
): boolean {
  if (!role) return false;
  if (role === 'SUPER_ADMIN') return true;
  if (role === 'ADMIN') return !ADMIN_RESTRICTED.includes(resource);

  if (role === 'AGENT') {
    if (!AGENT_RESOURCES.includes(resource)) return false;
    if (resource === 'inquiries' || resource === 'communications') {
      return action === 'read' || action === 'create' || action === 'update';
    }
    if (resource === 'bookings') {
      return action === 'read' || action === 'create';
    }
    if (resource === 'profile') {
      return action === 'read' || action === 'update';
    }
    return action === 'read';
  }

  if (role === 'COMPANY') {
    if (!COMPANY_RESOURCES.includes(resource)) return false;
    if (resource === 'bookings') {
      return action === 'read' || action === 'create';
    }
    if (resource === 'profile') {
      return action === 'read' || action === 'update';
    }
    return action === 'read';
  }

  return resource === 'profile' && action === 'read';
}

export function usePermissions() {
  const { user, role, isLoading } = useAuth();
  const currentRole = role as Role | undefined;

  const hasPermission = (action: string, resource: string) =>
    hasServerAlignedPermission(
      currentRole,
      action as PermissionAction,
      resource as PermissionResource,
    );

  const canAccessRoute = (pathname: string): boolean => {
    if (!currentRole) return false;

    // SUPER_ADMIN has full access
    if (currentRole === 'SUPER_ADMIN') return true;

    // Strict SUPER_ADMIN only routes
    if (
      pathname.includes('/admin/settings/roles') ||
      pathname.includes('/admin/audit')
    ) {
      return false;
    }

    // ADMIN can access all standard management routes except audit & roles settings
    if (currentRole === 'ADMIN') {
      return true;
    }

    // AGENT routes (operations, inquiries, communications, bookings, profile, dashboard)
    if (currentRole === 'AGENT') {
      const agentAllowedPrefixes = [
        '/dashboard',
        '/admin/dashboard',
        '/admin/inquiries',
        '/admin/tailor-made-inquiries',
        '/admin/communications',
        '/admin/bookings',
        '/admin/profile',
      ];
      return agentAllowedPrefixes.some((prefix) => pathname.includes(prefix));
    }

    // COMPANY routes (B2B bookings, commissions, wallet, profile, dashboard)
    if (currentRole === 'COMPANY') {
      const companyAllowedPrefixes = [
        '/dashboard',
        '/admin/dashboard',
        '/admin/bookings',
        '/admin/finance/commissions',
        '/admin/finance/wallet',
        '/admin/profile',
      ];
      return companyAllowedPrefixes.some((prefix) => pathname.includes(prefix));
    }

    return false;
  };

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isAdmin = currentRole === 'ADMIN' || isSuperAdmin;
  const isAgent = currentRole === 'AGENT';
  const isCompany = currentRole === 'COMPANY';
  const isB2B = isCompany || isAgent;

  return {
    user,
    role: currentRole,
    isLoading,
    isSuperAdmin,
    isAdmin,
    isAgent,
    isCompany,
    isB2B,
    canManageRoles: isSuperAdmin,
    canAccessAuditLogs: isSuperAdmin,
    canManageAdmins: isSuperAdmin,
    canAccessFullOperations: isAdmin,
    canManageTours: isAdmin,
    canManageUsers: isAdmin,
    canManagePromotions: isAdmin,
    canManageMedia: isAdmin,
    canAccessFinance: isAdmin || isCompany,
    hasPermission,
    canAccessRoute,
  };
}
