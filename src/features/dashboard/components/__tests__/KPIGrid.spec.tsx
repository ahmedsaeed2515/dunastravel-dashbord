import { render, screen } from '@testing-library/react';
import { KPIGrid } from '../KPIGrid';
import { describe, it, expect } from 'vitest';
import { ExecutiveSummary } from '../../types';

describe('KPIGrid', () => {
  const mockSummary: ExecutiveSummary = {
    revenue: {
      grossRevenue: 15000,
      prevGrossRevenue: 12000,
      revenueChangePercent: 25,
      collectedPayments: 14000,
      prevCollectedPayments: 11000,
      paymentsChangePercent: 27,
      outstandingBalance: 1000,
      currency: 'USD',
    },
    bookings: {
      total: 120,
      prevTotal: 100,
      changePercent: 20,
      byStatus: { CONFIRMED: 100, PENDING: 20 },
    },
    conversion: {
      rate: 4.5,
      totalConversions: 120,
      visitorViews: 2666,
    },
    capacity: {
      totalCapacity: 500,
      seatsSold: 425,
      totalRemainingSeats: 75,
      occupancyRate: 85,
    },
    operational: {
      activeToursCount: 25,
      openInquiriesCount: 8,
      unreadContactsCount: 3,
      failedNotificationsCount: 0,
    },
    dateRange: {
      from: '2026-07-01',
      to: '2026-07-31',
      prevFrom: '2026-06-01',
      prevTo: '2026-06-30',
    },
  };

  it('renders metric cards with formatted server data', () => {
    render(<KPIGrid data={mockSummary} isLoading={false} />);

    expect(screen.getByText('Gross Revenue')).toBeInTheDocument();
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders skeleton cards when loading', () => {
    const { container } = render(<KPIGrid isLoading={true} />);
    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });
});
