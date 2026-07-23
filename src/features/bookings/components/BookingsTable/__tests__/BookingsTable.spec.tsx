import { render, screen } from '@testing-library/react';
import { BookingsTable } from '../BookingsTable';
import { vi, describe, it, expect } from 'vitest';
import { useBookings } from '../../../hooks/useBookings';

vi.mock('../../../hooks/useBookings', () => ({
  useBulkUpdateBookings: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useSoftDeleteBooking: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useRestoreBooking: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useUpdateBooking: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBookingStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useAssignBooking: () => ({ mutate: vi.fn(), isPending: false }),
  useUpsertPassengers: () => ({ mutate: vi.fn(), isPending: false }),
  useBookings: vi.fn()
}));

describe('BookingsTable', () => {
  const mockData: any[] = [
    {
      id: "1",
      referenceCode: "B-12345",
      tourSlug: "maldives-luxury",
      status: "CONFIRMED",
      totalAmount: 5000,
      createdAt: "2023-10-01T12:00:00Z"
    },
    {
      id: "2",
      referenceCode: "B-67890",
      tourSlug: "dubai-experience",
      status: "PENDING",
      totalAmount: 2500,
      createdAt: "2023-10-02T12:00:00Z"
    }
  ];

  it('renders rows based on mock data', () => {
    const filters = { page: 1, limit: 10 };
    const onFilterChange = vi.fn();
    const onViewBooking = vi.fn();

    (useBookings as any).mockReturnValue({ data: { data: mockData, meta: { lastPage: 1 } }, isLoading: false });

    render(
      <BookingsTable />
    );

    expect(screen.getByText('B-12345')).toBeInTheDocument();
    expect(screen.getByText('maldives-luxury')).toBeInTheDocument();
    
    expect(screen.getByText('B-67890')).toBeInTheDocument();
    expect(screen.getByText('dubai-experience')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useBookings as any).mockReturnValue({ data: undefined, isLoading: true });

    render(
      <BookingsTable />
    );

    expect(screen.getByTestId('table-skeleton-row')).toBeInTheDocument();
  });
});
