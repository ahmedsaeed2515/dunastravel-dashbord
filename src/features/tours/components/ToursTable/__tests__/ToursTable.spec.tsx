import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToursTable } from '../ToursTable';
import { vi, describe, it, expect } from 'vitest';
import { useTours, useTourStats } from '../../../hooks/useTours';

vi.mock('@/components/trips/TripEditorModal', () => ({
  TripEditorModal: () => null,
}));

vi.mock('../../../hooks/useTours', () => ({
  useTours: vi.fn(),
  useTourStats: vi.fn(),
  useSoftDeleteTour: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useTourLifecycleAction: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useBulkUpdateTours: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useCreateTour: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useUpdateTour: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useReorderTours: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  useToggleFeatured: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false })
}));


function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('ToursTable', () => {
  const mockTours: any[] = [
    {
      id: "tour-1",
      slug: "pyramids-nile-cruise",
      title: "Pyramids & Nile Cruise",
      titleJsonb: { en: "Pyramids & Nile Cruise" },
      priceUsd: 1500,
      basePriceUsd: "1500",
      durationDays: 7,
      status: "PUBLISHED",
      createdAt: "2023-10-01T12:00:00Z"
    },
    {
      id: "tour-2",
      slug: "turkey-highlights",
      title: "Turkey Highlights",
      titleJsonb: { en: "Turkey Highlights" },
      priceUsd: 1800,
      basePriceUsd: "1800",
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

    renderWithClient(<ToursTable />);

    expect(screen.getByText('Pyramids & Nile Cruise')).toBeInTheDocument();
    expect(screen.getByText('Turkey Highlights')).toBeInTheDocument();
  });

  it('renders skeleton rows when loading', () => {
    (useTours as any).mockReturnValue({ data: undefined, isLoading: true });
    (useTourStats as any).mockReturnValue({ data: undefined, isLoading: true });

    renderWithClient(<ToursTable />);

    expect(screen.getByTestId('table-skeleton-row')).toBeInTheDocument();
  });

  it('shows the backend error instead of an empty tours view', () => {
    const refetch = vi.fn();
    (useTours as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Unauthorized'),
      refetch,
    });
    (useTourStats as any).mockReturnValue({ data: undefined, isLoading: false });

    renderWithClient(<ToursTable />);

    expect(screen.getByTestId('tours-load-error')).toHaveTextContent('Unauthorized');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
