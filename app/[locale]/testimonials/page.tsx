import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { TestimonialGridSection } from "@/components/landing/testimonial-grid-section"
import { LargeTestimonial } from "@/components/landing/large-testimonial"
import { AnimatedSection } from "@/components/landing/animated-section"
import { CTASection } from "@/components/landing/cta-section"
import { Header } from "@/components/landing/header"
import { TrustBadges } from "@/components/landing/trust-badges"
import { SocialProof } from "@/components/landing/social-proof"


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('testimonials');
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${siteUrl}/testimonials`,
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
      canonical: `${siteUrl}/testimonials`,
    },
  };
}

export default async function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 pt-20">
        <Header />
        <main className="max-w-[1320px] mx-auto relative px-4 md:px-6 pt-20">
          <AnimatedSection className="relative z-10" delay={0.1}>
            <LargeTestimonial />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <TestimonialGridSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <SocialProof />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <TrustBadges />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <CTASection />
          </AnimatedSection>
        </main>
      </div>
    </div>
  )
}
