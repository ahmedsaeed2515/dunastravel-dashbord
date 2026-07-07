import { render, screen } from '@testing-library/react';
import { RequirePermission } from '../RequirePermission';
import { vi, describe, it, expect } from 'vitest';

// Mock the permissions hook
vi.mock('../../../../hooks/usePermissions', () => ({
  usePermissions: vi.fn()
}));

import { usePermissions } from '../../../../hooks/usePermissions';

describe('RequirePermission', () => {
  it('renders children for ADMIN role', () => {
    (usePermissions as any).mockReturnValue({
      hasPermission: () => true,
      isLoading: false
    });

    render(
      <RequirePermission action="manage" resource="settings">
        <div data-testid="protected-content">Admin Content</div>
      </RequirePermission>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('blocks AGENT role from restricted paths like settings', () => {
    (usePermissions as any).mockReturnValue({
      hasPermission: (action: string, resource: string) => false,
      isLoading: false
    });

    render(
      <RequirePermission action="manage" resource="settings">
        <div data-testid="protected-content">Agent Content</div>
      </RequirePermission>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument();
  });

  it('allows AGENT role to view allowed paths like tours view', () => {
    (usePermissions as any).mockReturnValue({
      hasPermission: (action: string, resource: string) => true,
      isLoading: false
    });

    render(
      <RequirePermission action="read" resource="tours">
        <div data-testid="allowed-content">Agent Allowed Content</div>
      </RequirePermission>
    );

    expect(screen.getByTestId('allowed-content')).toBeInTheDocument();
  });
});
