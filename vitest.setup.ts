import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import enMessages from './src/messages/en.json';

// Mock matchMedia for UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock next-intl hooks globally for unit tests
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    return (key: string, options?: any) => {
      if (options && options.name) return `Welcome back, ${options.name}`;
      if (options && options.selected !== undefined) return `${options.selected} of ${options.total} row(s) selected.`;
      if (options && options.current !== undefined) return `Page ${options.current} of ${options.total}`;
      
      const ns = namespace ? (enMessages as any)[namespace] : enMessages;
      if (ns && ns[key]) {
        return ns[key];
      }
      return key;
    };
  },
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: any }) => children,
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
  usePathname: () => '/admin',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
