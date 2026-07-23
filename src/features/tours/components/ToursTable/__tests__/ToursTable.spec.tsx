import { render, screen } from '@testing-library/react';
import { ToursTable } from '../ToursTable';
import { vi, describe, it, expect } from 'vitest';
import { useTours, useTourStats } from '../../../hooks/useTours';

vi.mock('../../../hooks/useTours', () => ({
  useTours: vi.fn(),
  useTourStats: vi.fn(),
  useSoftDeleteTour: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useBulkUpdateTours: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useCreateTour: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useUpdateTour: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false })
}));

describe('ToursTable', () => {
  const mockTours: any[] = [
    {
      id: "tour-1",
      slug: "pyramids-nile-cruise",
      title: "Pyramids & Nile Cruise",
      priceUsd: 1500,
      durationDays: 7,
      status: "PUBLISHED",
      createdAt: "2023-10-01T12:00:00Z"
    },
    {
      id: "tour-2",
      slug: "turkey-highlights",
      title: "Turkey Highlights",
      priceUsd: 1800,
      durationDays: 10,
      status: "DRAFT",
      createdAt: "2023-10-02T12:00:00Z"
    }
  ];

  it('renders tour items successfully', () => {
    (useTours as any).mockReturnValue({
      data: { data: mockTours, meta: { lastPage: 1, total: 2 } },
      isLoading: false
    });
    (useTourStats as any).mockReturnValue({
      data: { total: 2, published: 1, draft: 1, archived: 0 },
      isLoading: false
    });

    render(<ToursTable />);

    expect(screen.getByText('Pyramids & Nile Cruise')).toBeInTheDocument();
    expect(screen.getByText('Turkey Highlights')).toBeInTheDocument();
  });

  it('renders skeleton rows when loading', () => {
    (useTours as any).mockReturnValue({ data: undefined, isLoading: true });
    (useTourStats as any).mockReturnValue({ data: undefined, isLoading: true });

    render(<ToursTable />);

    expect(screen.getByTestId('table-skeleton-row')).toBeInTheDocument();
  });
});
