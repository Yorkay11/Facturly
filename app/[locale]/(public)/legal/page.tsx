import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Scale } from "lucide-react";
import { LegalPageHeader } from "@/components/layout/LegalPageHeader";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.mentions' });
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  };
}

const sections = ['publisher', 'hosting', 'payment'] as const;

export default async function LegalMentionsPage() {
  const t = await getTranslations('legal.mentions');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LegalPageHeader
        icon={<Scale className="h-4 w-4" />}
        lastUpdated=""
        backToHome={t('backToHome')}
      />
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('title')}</h1>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section} className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                {t(`${section}.title`)}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {t(`${section}.content`)}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
