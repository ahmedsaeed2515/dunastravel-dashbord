import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { vi, describe, it, expect } from 'vitest';
import { useAuth } from '@/features/auth/hooks/useAuth';

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('usePermissions hook', () => {
  it('grants full access for SUPER_ADMIN role', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'SUPER_ADMIN', name: 'Super Admin' },
      role: 'SUPER_ADMIN',
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canManageRoles).toBe(true);
    expect(result.current.canAccessAuditLogs).toBe(true);
    expect(result.current.hasPermission('manage', 'roles')).toBe(true);
    expect(result.current.canAccessRoute('/admin/settings/roles')).toBe(true);
  });

  it('restricts ADMIN role from role management and system audit logs', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '2', role: 'ADMIN', name: 'Standard Admin' },
      role: 'ADMIN',
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canManageRoles).toBe(false);
    expect(result.current.canAccessAuditLogs).toBe(false);
    expect(result.current.canManageTours).toBe(true);
    expect(result.current.hasPermission('manage', 'tours')).toBe(true);
    expect(result.current.hasPermission('manage', 'roles')).toBe(false);
    expect(result.current.canAccessRoute('/admin/settings/roles')).toBe(false);
  });

  it('restricts AGENT / B2B role to allowed self-service paths and read operations', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '3', role: 'AGENT', name: 'Partner Agent' },
      role: 'AGENT',
      isLoading: false,
    });

    const { result } = renderHook(() => usePermissions());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isB2B).toBe(true);
    expect(result.current.isAgent).toBe(true);
    expect(result.current.canManageTours).toBe(false);
    expect(result.current.hasPermission('read', 'bookings')).toBe(true);
    expect(result.current.hasPermission('delete', 'tours')).toBe(false);
    expect(result.current.canAccessRoute('/admin/bookings')).toBe(true);
    expect(result.current.canAccessRoute('/admin/tours')).toBe(false);
  });
});
