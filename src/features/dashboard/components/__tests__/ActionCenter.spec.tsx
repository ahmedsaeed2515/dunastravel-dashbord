import { render, screen } from '@testing-library/react';
import { ActionCenter } from '../ActionCenter';
import { describe, it, expect } from 'vitest';
import { ActionAlert } from '../../types';

describe('ActionCenter', () => {
  const mockAlerts: ActionAlert[] = [
    {
      id: 'alert-pending-bookings',
      severity: 'high',
      title: 'Pending Bookings Require Review',
      reason: '3 new customer booking(s) are awaiting admin review & confirmation.',
      count: 3,
      actionLink: '/admin/bookings?status=PENDING',
    },
    {
      id: 'alert-new-inquiries',
      severity: 'high',
      title: 'Unanswered Customer Inquiries',
      reason: '2 tailor-made trip inquiry/inquiries have received no response yet.',
      count: 2,
      actionLink: '/admin/inquiries?status=NEWLY_RECEIVED',
    },
  ];

  it('renders operational alerts with counts and action links', () => {
    render(<ActionCenter alerts={mockAlerts} isLoading={false} />);

    expect(screen.getByText(/Operational Action Center/)).toBeInTheDocument();
    expect(screen.getByText('Pending Bookings Require Review')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Unanswered Customer Inquiries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders all clear state when alerts array is empty', () => {
    render(<ActionCenter alerts={[]} isLoading={false} />);

    expect(
      screen.getByText(/Operational Action Center — All Systems Clear/),
    ).toBeInTheDocument();
  });

  it('renders loading indicator when isLoading is true', () => {
    render(<ActionCenter isLoading={true} />);

    expect(
      screen.getByText(/Operational Action Center Loading/),
    ).toBeInTheDocument();
  });
});
