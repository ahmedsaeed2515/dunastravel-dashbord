import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InquiriesTable } from '../InquiriesTable';
import { vi, describe, it, expect } from 'vitest';
import { Inquiry } from '../../types';

vi.mock('next-intl', () => ({
  useLocale: () => 'ar',
  useTranslations: () => (key: string) => key,
}));

vi.mock('../../hooks/useCommunications', () => ({
  useAssignInquiry: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateInquiryStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateInquiry: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useConvertInquiryToBooking: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/users/hooks/useUsers', () => ({
  useUsers: () => ({
    data: { data: [] },
    isLoading: false,
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

describe('InquiriesTable', () => {
  const mockInquiries: Inquiry[] = [
    {
      id: 'inq-1',
      referenceCode: 'INQ-2026-001',
      fullName: 'Youssef Mansour',
      email: 'youssef@example.com',
      phone: '+20100998877',
      status: 'NEWLY_RECEIVED',
      destinations: ['Cairo', 'Siwa Oasis'],
      adults: 2,
      children: 1,
      createdAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'inq-2',
      referenceCode: 'INQ-2026-002',
      fullName: 'Sofia Rossi',
      email: 'sofia@example.it',
      phone: '+39061234567',
      status: 'QUOTED',
      destinations: ['Luxor', 'Aswan'],
      adults: 2,
      children: 0,
      quotedAmountUsd: '3200.00',
      createdAt: '2026-10-21T11:00:00Z',
    },
  ];

  it('renders loading state when isLoading is true', () => {
    renderWithClient(
      <InquiriesTable
        data={[]}
        isLoading={true}
        pageCount={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/جاري تحميل الطلبات والاستفسارات/i),
    ).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    renderWithClient(
      <InquiriesTable
        data={[]}
        isLoading={false}
        pageCount={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/لا توجد استفسارات مطابقة لخيارات البحث الحالية/i),
    ).toBeInTheDocument();
  });

  it('renders inquiries with referenceCode, client name, email, and destinations', () => {
    renderWithClient(
      <InquiriesTable
        data={mockInquiries}
        isLoading={false}
        pageCount={1}
        currentPage={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('INQ-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Youssef Mansour')).toBeInTheDocument();
    expect(screen.getByText('youssef@example.com')).toBeInTheDocument();
    expect(screen.getByText('INQ-2026-002')).toBeInTheDocument();
    expect(screen.getByText('Sofia Rossi')).toBeInTheDocument();
    expect(screen.getByText('sofia@example.it')).toBeInTheDocument();
  });
});
