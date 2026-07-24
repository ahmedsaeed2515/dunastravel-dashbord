import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar', 'es', 'pt', 'it'],
  defaultLocale: 'ar'
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
