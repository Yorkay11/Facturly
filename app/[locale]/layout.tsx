import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '../providers';
import { Toaster } from 'sonner';
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/analytics/GoogleTagManager';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { BetaBannerWrapper } from '@/components/layout/BetaBannerWrapper';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { GlobalLoadingHandler } from '@/components/layout/GlobalLoadingHandler';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <>
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
          <GoogleTagManagerNoscript gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        </>
      )}
      <NextIntlClientProvider messages={messages}>
        <LoadingProvider>
          <GlobalLoadingHandler />
          <BetaBannerWrapper />
          <Providers>
            {children}
            <Toaster 
              position="top-right"
              closeButton
            />
          </Providers>
        </LoadingProvider>
      </NextIntlClientProvider>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

