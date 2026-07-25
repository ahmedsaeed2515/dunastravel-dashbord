export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
    csrf: () => ['auth', 'csrf'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => ['dashboard', 'metrics'] as const,
    reports: (type: string) => ['dashboard', 'reports', type] as const,
  },
  tours: {
    all: ['tours'] as const,
    lists: () => ['tours', 'list'] as const,
    list: (filters?: Record<string, unknown>) => ['tours', 'list', filters] as const,
    details: () => ['tours', 'detail'] as const,
    detail: (slug: string) => ['tours', 'detail', slug] as const,
    stats: () => ['tours', 'stats'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    lists: () => ['bookings', 'list'] as const,
    list: (filters?: Record<string, unknown>) => ['bookings', 'list', filters] as const,
    details: () => ['bookings', 'detail'] as const,
    detail: (ref: string) => ['bookings', 'detail', ref] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
    details: () => ['users', 'detail'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    crmMetrics: () => ['users', 'crm', 'metrics'] as const,
  },
  finance: {
    all: ['finance'] as const,
    commissions: (filters?: Record<string, unknown>) => ['finance', 'commissions', filters] as const,
    commissionsMetrics: () => ['finance', 'commissions', 'metrics'] as const,
    wallets: (ownerType?: string, ownerId?: string) => ['finance', 'wallets', ownerType, ownerId] as const,
    walletsMetrics: () => ['finance', 'wallets', 'metrics'] as const,
    transactions: (walletId: string) => ['finance', 'wallets', walletId, 'transactions'] as const,
  },
  inquiries: {
    all: ['inquiries'] as const,
    list: (filters?: Record<string, unknown>) => ['inquiries', 'list', filters] as const,
    detail: (ref: string) => ['inquiries', 'detail', ref] as const,
  },
  media: {
    all: ['media'] as const,
    list: (filters?: Record<string, unknown>) => ['media', 'list', filters] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    list: (filters?: Record<string, unknown>) => ['reviews', 'list', filters] as const,
  },
  promotions: {
    all: ['promotions'] as const,
    list: (filters?: Record<string, unknown>) => ['promotions', 'list', filters] as const,
  },
  settings: {
    all: ['settings'] as const,
    detail: (key: string) => ['settings', key] as const,
  },
  cms: {
    all: ['cms'] as const,
    detail: (key: string) => ['cms', key] as const,
  },
  audit: {
    all: ['audit'] as const,
    list: (filters?: Record<string, unknown>) => ['audit', 'list', filters] as const,
  },
};
