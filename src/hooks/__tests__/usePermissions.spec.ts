import { describe, expect, it } from 'vitest';
import { hasServerAlignedPermission } from '../usePermissions';

describe('permission registry', () => {
  it('denies an absent role instead of inferring super-admin access', () => {
    expect(hasServerAlignedPermission(undefined, 'manage', 'roles')).toBe(false);
  });

  it('keeps audit and role management super-admin-only in the UI registry', () => {
    expect(hasServerAlignedPermission('ADMIN', 'read', 'audit')).toBe(false);
    expect(hasServerAlignedPermission('ADMIN', 'manage', 'roles')).toBe(false);
    expect(hasServerAlignedPermission('SUPER_ADMIN', 'manage', 'roles')).toBe(true);
  });

  it('limits agent/company access to documented read/create operations', () => {
    expect(hasServerAlignedPermission('AGENT', 'create', 'bookings')).toBe(true);
    expect(hasServerAlignedPermission('AGENT', 'delete', 'bookings')).toBe(false);
    expect(hasServerAlignedPermission('COMPANY', 'read', 'wallet')).toBe(true);
  });
});
