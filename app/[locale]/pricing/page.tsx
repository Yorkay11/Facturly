import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { Header } from "@/components/landing/header"
import { FooterSection } from "@/components/landing/footer-section"
import { PricingPageContent } from "@/components/pricing/pricing-page-content"
import { PricingFAQ } from "@/components/pricing/pricing-faq-simple"
import { PricingComparison } from "@/components/pricing/pricing-comparison"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.facturly.online";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing.metadata');
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      "tarifs facturation",
      "prix facturly",
      "plans facturation",
      "facturation gratuite",
      "abonnement facturation",
      "prix mobile money",
      "facturation afrique"
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteUrl}/pricing`,
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
      description: t('description'),
      images: [`${siteUrl}/icon.png`],
    },
    alternates: {
      canonical: `${siteUrl}/pricing`,
    },
  };
}

export default async function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-20">
      <Header />
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <PricingPageContent />
          <div className="mt-16 md:mt-24">
            <PricingComparison />
          </div>
          <div className="mt-16 md:mt-24">
            <PricingFAQ />
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  )
}
