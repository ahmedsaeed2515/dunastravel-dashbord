import { render, screen } from '@testing-library/react';
import { KPIGrid } from '../KPIGrid';
import { vi, describe, it, expect } from 'vitest';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

vi.mock('../../hooks/useDashboardMetrics', () => ({
  useDashboardMetrics: vi.fn()
}));

describe('KPIGrid', () => {
  it('renders metric cards with formatted server data', () => {
    (useDashboardMetrics as any).mockReturnValue({
      data: {
        tours: {
          totalTours: 25,
          publishedTours: 20,
          occupancyRate: 85,
          totalCapacity: 500
        },
        general: {
          totalBookings: 120,
          bookingsThisMonth: 15,
          openInquiries: 8,
          totalInquiries: 30,
          unreadContactSubmissions: 3,
          totalNotificationsFailed: 0
        }
      },
      isLoading: false
    });

    render(<KPIGrid />);

    expect(screen.getByText('Total Tours')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('Occupancy Rate')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders skeleton cards when loading', () => {
    (useDashboardMetrics as any).mockReturnValue({ data: undefined, isLoading: true });

    const { container } = render(<KPIGrid />);
    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });
});
