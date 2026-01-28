import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { BentoSection } from "@/components/landing/bento-section"
import { WhyFacturlySection } from "@/components/landing/why-facturly-section"
import { MobileMoneySection } from "@/components/landing/mobile-money-section"
import { AnimatedSection } from "@/components/landing/animated-section"
import { CTASection } from "@/components/landing/cta-section"
import { Header } from "@/components/landing/header"
import { FeaturesSection } from "@/components/landing/features-section";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing.bento');
  
  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `${siteUrl}/features`,
      siteName: "Facturly",
      images: [
        {
          url: `${siteUrl}/icon.png`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t('title'),
      description: t('subtitle'),
      images: [`${siteUrl}/icon.png`],
    },
    alternates: {
      canonical: `${siteUrl}/features`,
    },
  };
}

export default async function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 pt-20">
        <Header />
        <main className="max-w-[1320px] mx-auto relative px-4 md:px-6 pt-20">
          <AnimatedSection className="relative z-10" delay={0.1}>
            <BentoSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
          <FeaturesSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.3}>
            <MobileMoneySection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <CTASection />
          </AnimatedSection>
        </main>
      </div>
    </div>
  )
}
