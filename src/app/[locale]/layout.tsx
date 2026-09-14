import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/providers/theme-provider';
import '../globals.css';

const playfair = { variable: 'font-playfair' };
const montserrat = { variable: 'font-montserrat' };

import { DirectionProvider } from "@radix-ui/react-direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/components/providers/query-provider";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "@/components/ui/sonner";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${montserrat.variable} ${playfair.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <DirectionProvider dir={dir}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <QueryProvider>
                <DataProvider>
                  <TooltipProvider>
                    {children}
                  </TooltipProvider>
                </DataProvider>
              </QueryProvider>
              <Toaster position={dir === 'rtl' ? 'top-left' : 'top-right'} richColors />
            </ThemeProvider>
          </DirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
