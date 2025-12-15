import type { Metadata } from "next";
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


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://facturly.online";

export const metadata: Metadata = {
  title: "Facturation simple & intelligente pour votre entreprise",
  description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel. Rejoignez des milliers de professionnels qui font confiance à Facturly.",
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
    title: "Facturly - Facturation simple & intelligente",
    description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel.",
    url: siteUrl,
    siteName: "Facturly",
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1200,
        height: 630,
        alt: "Facturly - Facturation simple & intelligente",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facturly - Facturation simple & intelligente",
    description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel.",
    images: [`${siteUrl}/icon.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function LandingPage() {
  const faqData = [
    {
      question: "Qu'est-ce que Facturly et pour qui est-ce fait ?",
      answer:
        "Facturly est une plateforme de gestion de facturation conçue pour les freelances, les petites entreprises et les professionnels qui souhaitent simplifier leur facturation. C'est parfait pour les indépendants qui veulent gagner du temps et les équipes qui cherchent une solution professionnelle de gestion de factures.",
    },
    {
      question: "Comment fonctionne l'envoi de factures par email ?",
      answer:
        "Lorsque vous créez une facture, vous pouvez l'envoyer directement par email à votre client. Il recevra un lien sécurisé pour visualiser la facture, l'accepter et la payer en ligne. Le système suit automatiquement l'état de la facture et vous notifie des paiements.",
    },
    {
      question: "Puis-je intégrer Facturly avec mes outils existants ?",
      answer:
        "Oui ! Facturly offre des intégrations avec les outils comptables les plus populaires. Notre API permet également de connecter Facturly à votre système existant.",
    },
    {
      question: "Que comprend le plan gratuit ?",
      answer:
        "Le plan gratuit comprend jusqu'à 10 factures par mois, une gestion illimitée de clients, l'envoi par email, un tableau de bord de base et le support par email. C'est parfait pour démarrer et tester la plateforme.",
    },
    {
      question: "Comment fonctionne le paiement en ligne ?",
      answer:
        "Lorsqu'un client accepte une facture, il peut la payer directement en ligne via un lien sécurisé. Les paiements sont traités de manière sécurisée et vous êtes notifié instantanément. La facture est automatiquement marquée comme payée dans votre tableau de bord.",
    },
    {
      question: "Mes données sont-elles sécurisées avec Facturly ?",
      answer:
        "Absolument. Nous utilisons des mesures de sécurité de niveau entreprise incluant le chiffrement de bout en bout, la transmission sécurisée des données et la conformité aux standards de l'industrie. Vos données financières sont protégées et ne sont jamais partagées sans votre autorisation explicite.",
    },
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Facturly",
    "url": siteUrl,
    "logo": `${siteUrl}/icon.png`,
    "description": "Plateforme de gestion de facturation simple et intelligente",
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
        "name": "Accueil",
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
      <div className="min-h-screen bg-background relative overflow-hidden pb-0">
        <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative" id="hero-container">
          <HeroSection />
          <div className="absolute bottom-[-150px] md:bottom-[-400px] left-1/2 transform -translate-x-1/2 z-30">
            <DashboardPreview />
          </div>
        </main>
        <AnimatedSection className="relative z-10 max-w-[1320px] mx-auto px-6 mt-[411px] md:mt-[400px]" delay={0.1}>
          <SocialProof />
        </AnimatedSection>
        <AnimatedSection id="features-section" className="relative z-10 max-w-[1320px] mx-auto mt-16" delay={0.2}>
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
