import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommissionsTable } from '../CommissionsTable';
import { vi, describe, it, expect } from 'vitest';
import { Commission } from '../../types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/lib/status-localization', () => ({
  useLocalizedStatus: () => (status: string) => status,
}));

vi.mock('../../hooks/useFinance', () => ({
  useUpdateCommissionStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('CommissionsTable', () => {
  const mockData: Commission[] = [
    {
      id: 'comm-1',
      companyId: 'comp-1',
      bookingId: 'book-1',
      rate: '15',
      amount: '350.00',
      currency: 'USD',
      status: 'APPROVED',
      createdAt: '2026-10-15T12:00:00Z',
      company: {
        name: 'Royal Voyage Agency',
        referenceCode: 'RVA-01',
      },
      booking: {
        referenceCode: 'BK-LUX-99',
        totalAmountUsd: '2333.33',
        invoiceNumber: 'INV-2026-001',
      },
    },
    {
      id: 'comm-2',
      companyId: 'comp-2',
      bookingId: 'book-2',
      rate: '10',
      amount: '120.00',
      currency: 'USD',
      status: 'PENDING',
      createdAt: '2026-10-16T15:00:00Z',
      company: {
        name: 'Desert Star Tourism',
        referenceCode: 'DST-02',
      },
      booking: {
        referenceCode: 'BK-DES-12',
        totalAmountUsd: '1200.00',
      },
    },
  ];

  it('renders loading state when isLoading is true', () => {
    renderWithClient(
      <CommissionsTable
        data={[]}
        isLoading={true}
        pageCount={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/جاري تحميل سجلات العمولات/i)).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    renderWithClient(
      <CommissionsTable
        data={[]}
        isLoading={false}
        pageCount={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/لا توجد سجلات عمولات مسجلة حالياً/i),
    ).toBeInTheDocument();
  });

  it('renders commission rows correctly with partner and booking info', () => {
    renderWithClient(
      <CommissionsTable
        data={mockData}
        isLoading={false}
        pageCount={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Royal Voyage Agency')).toBeInTheDocument();
    expect(screen.getByText('BK-LUX-99')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Desert Star Tourism')).toBeInTheDocument();
    expect(screen.getByText('BK-DES-12')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('$350.00')).toBeInTheDocument();
  });
});
