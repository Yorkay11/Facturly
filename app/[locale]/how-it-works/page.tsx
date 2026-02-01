import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/landing/header";
import { FooterSection } from "@/components/landing/footer-section";
import { CTASection } from "@/components/landing/cta-section";
import { HowItWorksContent } from "./HowItWorksContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.facturly.online";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'howItWorks' });
  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    openGraph: {
      title: t('metadata.title'),
      description: t('metadata.description'),
      url: `${siteUrl}/how-it-works`,
      siteName: "Facturly",
      type: "website",
    },
  };
}

export default async function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 pt-20">
        <Header />
        <main>
          <HowItWorksContent />
        </main>
        <FooterSection />
      </div>
    </div>
  );
}
