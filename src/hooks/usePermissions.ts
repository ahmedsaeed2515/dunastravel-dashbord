"use client";

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Role } from '@/lib/api-types';

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';
export type PermissionResource = 'dashboard' | 'bookings' | 'tours' | 'destinations' | 'hotels' | 'reviews' | 'promotions' | 'media' | 'finance' | 'commissions' | 'wallet' | 'customers' | 'companies' | 'agents' | 'inquiries' | 'communications' | 'content' | 'ai' | 'notifications' | 'audit' | 'settings' | 'roles' | 'profile';

const B2B_READ_RESOURCES: readonly PermissionResource[] = ['bookings', 'commissions', 'wallet', 'profile'];
const ADMIN_RESTRICTED: readonly PermissionResource[] = ['roles', 'audit'];

export function hasServerAlignedPermission(role: Role | undefined, action: PermissionAction, resource: PermissionResource): boolean {
  if (!role) return false;
  if (role === 'SUPER_ADMIN') return true;
  if (role === 'ADMIN') return !ADMIN_RESTRICTED.includes(resource);
  if (role === 'AGENT' || role === 'COMPANY') return B2B_READ_RESOURCES.includes(resource) && (resource !== 'bookings' ? action === 'read' : action === 'read' || action === 'create');
  return resource === 'profile' && action === 'read';
}

export function usePermissions() {
  const { user, role, isLoading } = useAuth();
  const currentRole = role as Role | undefined;
  const hasPermission = (action: string, resource: string) => hasServerAlignedPermission(currentRole, action as PermissionAction, resource as PermissionResource);
  const canAccessRoute = (pathname: string) => {
    if (pathname.includes('/admin/settings/roles')) return hasPermission('manage', 'roles');
    if (pathname.includes('/admin/audit')) return hasPermission('read', 'audit');
    if (pathname.includes('/admin/finance/commissions')) return hasPermission('read', 'commissions');
    if (pathname.includes('/admin/finance/wallet')) return hasPermission('read', 'wallet');
    if (pathname.includes('/admin/bookings')) return hasPermission('read', 'bookings');
    return hasPermission('read', 'dashboard');
  };
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isAdmin = currentRole === 'ADMIN' || isSuperAdmin;
  const isAgent = currentRole === 'AGENT';
  const isB2B = currentRole === 'COMPANY' || isAgent;
  return { user, role: currentRole, isLoading, isSuperAdmin, isAdmin, isAgent, isB2B, canManageRoles: isSuperAdmin, canAccessAuditLogs: isSuperAdmin, canManageAdmins: isSuperAdmin, canAccessFullOperations: isAdmin, canManageTours: isAdmin, canManageUsers: isAdmin, canManagePromotions: isAdmin, canManageMedia: isAdmin, canAccessFinance: isAdmin || isB2B, hasPermission, canAccessRoute };
}
