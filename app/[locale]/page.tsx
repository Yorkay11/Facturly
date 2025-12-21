import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { HeroSection } from "@/components/landing/hero-section"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { SocialProof } from "@/components/landing/social-proof"
import { BentoSection } from "@/components/landing/bento-section"
import { LargeTestimonial } from "@/components/landing/large-testimonial"
import { PricingSection } from "@/components/landing/pricing-section"
import { TestimonialGridSection } from "@/components/landing/testimonial-grid-section"
import { FAQSection } from "@/components/landing/faq-section"
import { CTASection } from "@/components/landing/cta-section"
import { FooterSection } from "@/components/landing/footer-section"
import { AnimatedSection } from "@/components/landing/animated-section"


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.facturly.online";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  
  return {
    title: t('landingTitle'),
    description: t('landingDescription'),
    keywords: [
      "facturation en ligne",
      "logiciel facturation",
      "gestion factures",
      "facture automatique",
      "paiement en ligne",
      "relance facture",
      "comptabilité automatique",
      "gestion clients",
      "suivi paiements",
      "facturation professionnelle"
    ],
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: siteUrl,
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
      canonical: siteUrl,
    },
  };
}

export default async function LandingPage() {
  const tFaq = await getTranslations('landing.faq.items');
  const tMeta = await getTranslations('metadata');
  
  const faqData = [
    {
      question: tFaq('whatIs.question'),
      answer: tFaq('whatIs.answer'),
    },
    {
      question: tFaq('emailSending.question'),
      answer: tFaq('emailSending.answer'),
    },
    {
      question: tFaq('integrations.question'),
      answer: tFaq('integrations.answer'),
    },
    {
      question: tFaq('freePlan.question'),
      answer: tFaq('freePlan.answer'),
    },
    {
      question: tFaq('onlinePayment.question'),
      answer: tFaq('onlinePayment.answer'),
    },
    {
      question: tFaq('security.question'),
      answer: tFaq('security.answer'),
    },
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Facturly",
    "url": siteUrl,
    "logo": `${siteUrl}/icon.png`,
    "description": tMeta('organizationDescription'),
    "sameAs": [
      // Ajoutez vos liens sociaux ici
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@facturly.app",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": tMeta('home'),
        "item": siteUrl,
      },
    ],
  };

  

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <div className="min-h-screen bg-background relative overflow-hidden pb-0 mt-20">
          <div className="relative z-10">
          <main className="max-w-[1320px] mx-auto relative px-4 md:px-0" id="hero-container">
            <HeroSection />
            <div className="absolute bottom-[-150px] md:bottom-[-400px] left-1/2 transform -translate-x-1/2 z-30">
              <DashboardPreview />
            </div>
          </main>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto px-6 mt-40 md:mt-[400px]" delay={0.1}>
            <SocialProof />
          </AnimatedSection>
          <AnimatedSection id="features-section" className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <BentoSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <LargeTestimonial />
          </AnimatedSection>
          <AnimatedSection
            id="pricing-section"
            className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <PricingSection />
          </AnimatedSection>
          <AnimatedSection
            id="testimonials-section"
            className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16"
            delay={0.2}
          >
            <TestimonialGridSection />
          </AnimatedSection>
          <AnimatedSection id="faq-section" className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <FAQSection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <CTASection />
          </AnimatedSection>
          <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto mt-8 md:mt-16" delay={0.2}>
            <FooterSection />
          </AnimatedSection>
        </div>
      </div>
    </>
  )
}

