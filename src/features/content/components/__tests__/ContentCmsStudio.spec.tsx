import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContentCmsStudio } from '../ContentCmsStudio';
import { vi, describe, it, expect } from 'vitest';
import { ContentBlock } from '../../types';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBlocks: ContentBlock[] = [
  {
    id: 'block-1',
    key: 'homepage.hero',
    content: {
      en: { title: 'Experience Luxury Travel', subtitle: 'Curated by Dunas' },
      ar: { title: 'عش تجربة السفر الفاخر', subtitle: 'برعاية دوناس' },
    },
    status: 'PUBLISHED',
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'block-2',
    key: 'footer.contact',
    content: {
      en: { phone: '+20 114 940 1111', email: 'vip@dunastravel.com' },
      ar: { phone: '+20 114 940 1111', email: 'vip@dunastravel.com' },
    },
    status: 'PUBLISHED',
    version: 2,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-10-02T00:00:00Z',
  },
];

vi.mock('../../hooks/useContent', () => ({
  useContentBlocks: () => ({
    data: { data: mockBlocks, total: 2 },
    isLoading: false,
    refetch: vi.fn(),
    isRefetching: false,
  }),
  useUpdateContentBlock: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useSeedDefaults: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ count: 5 }),
    isPending: false,
  }),
  useDeleteContentBlock: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
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

describe('ContentCmsStudio', () => {
  it('renders language selector and CMS tabs', () => {
    renderWithClient(<ContentCmsStudio />);

    // Check language options
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('العربية')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Português')).toBeInTheDocument();
    expect(screen.getByText('Italiano')).toBeInTheDocument();
  });
});
