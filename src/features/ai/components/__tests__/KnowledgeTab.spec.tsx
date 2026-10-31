import { render, screen } from '@testing-library/react';
import { KnowledgeTab } from '../KnowledgeTab';
import { vi, describe, it, expect } from 'vitest';
import { aiApi } from '../../api/aiApi';

vi.mock('../../api/aiApi', () => ({
  aiApi: {
    getKnowledgeSyncStatus: vi.fn().mockResolvedValue({
      status: 'SYNCED',
      lastSyncedAt: '2026-10-31T12:00:00Z',
      snapshotVersion: 'v5.2.0',
      totalChunks: 1420,
      activeToursCount: 48,
    }),
    getCanonicalKnowledgeEntities: vi.fn().mockResolvedValue({
      entities: [
        {
          id: 'ent-1',
          name: 'Grand Egyptian Museum Tour',
          category: 'TOUR',
          totalChunks: 12,
          isRecommendationAllowed: true,
          isExcludedFromAi: false,
          locales: ['ar', 'en', 'es', 'pt', 'it'],
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    }),
    getKnowledgeProblemsSummary: vi.fn().mockResolvedValue({
      missingTranslations: 0,
      staleChunks: 0,
    }),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('KnowledgeTab', () => {
  it('renders knowledge sync engine header, synchronized badge, and actions', async () => {
    const mockT = (key: string) => key;
    render(<KnowledgeTab t={mockT} isAr={false} />);

    expect(screen.getByText('Guider Knowledge Center')).toBeInTheDocument();
    expect(screen.getByText(/Synchronized/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Q&A Directives \(If asked X\.\.\.\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Add Custom Knowledge/i)).toBeInTheDocument();
  });
});
