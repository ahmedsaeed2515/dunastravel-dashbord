import { render, screen } from '@testing-library/react';
import { WalletsDirectoryTable } from '../WalletsDirectoryTable';
import { vi, describe, it, expect } from 'vitest';
import { WalletDirectoryItem } from '../../types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WalletsDirectoryTable', () => {
  const mockWallets: WalletDirectoryItem[] = [
    {
      id: 'w-1',
      ownerType: 'COMPANY',
      ownerId: 'comp-1',
      currency: 'USD',
      balance: '14500.50',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      transactionsCount: 24,
      owner: {
        id: 'comp-1',
        name: 'Grand Sahara Luxury Tours',
        referenceCode: 'GSLT-01',
        commissionRate: 12.5,
      },
    },
    {
      id: 'w-2',
      ownerType: 'USER',
      ownerId: 'usr-agent-2',
      currency: 'USD',
      balance: '2300.00',
      status: 'ACTIVE',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-10-02T00:00:00Z',
      transactionsCount: 8,
      owner: {
        id: 'usr-agent-2',
        name: 'Karim Agent',
        email: 'karim@dunasluxury.com',
      },
    },
  ];

  it('renders loading state when isLoading is true', () => {
    render(
      <WalletsDirectoryTable
        data={[]}
        isLoading={true}
        onViewLedger={vi.fn()}
        onDeposit={vi.fn()}
        onDebit={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/جاري تحميل دليل محافظ الشركاء والوكلاء/i),
    ).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(
      <WalletsDirectoryTable
        data={[]}
        isLoading={false}
        onViewLedger={vi.fn()}
        onDeposit={vi.fn()}
        onDebit={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/لا توجد محافظ شركاء مسجلة حالياً/i),
    ).toBeInTheDocument();
  });

  it('renders partner and agent wallet details correctly', () => {
    render(
      <WalletsDirectoryTable
        data={mockWallets}
        isLoading={false}
        onViewLedger={vi.fn()}
        onDeposit={vi.fn()}
        onDebit={vi.fn()}
      />,
    );

    expect(screen.getByText('Grand Sahara Luxury Tours')).toBeInTheDocument();
    expect(screen.getByText('#GSLT-01')).toBeInTheDocument();
    expect(screen.getByText('$14,500.50')).toBeInTheDocument();
    expect(screen.getByText(/12.5%/)).toBeInTheDocument();
    expect(screen.getByText('Karim Agent')).toBeInTheDocument();
    expect(screen.getByText('karim@dunasluxury.com')).toBeInTheDocument();
    expect(screen.getByText('$2,300.00')).toBeInTheDocument();
  });
});
