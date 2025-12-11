import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google'
import Providers from "./providers";
import { Toaster } from "sonner";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/GoogleTagManager";



const inter = Nunito({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://facturly.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Facturly - Facturation simple & intelligente",
    template: "%s | Facturly"
  },
  description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel avec Facturly.",
  keywords: [
    "facturation",
    "facture",
    "gestion factures",
    "comptabilité",
    "paiement en ligne",
    "relance facture",
    "logiciel facturation",
    "facturation automatique",
    "gestion clients",
    "suivi paiements"
  ],
  authors: [{ name: "Facturly" }],
  creator: "Facturly",
  publisher: "Facturly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Facturly",
    title: "Facturly - Facturation simple & intelligente",
    description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel.",
    images: [
      {
        url: `${siteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Facturly - Facturation simple & intelligente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Facturly - Facturation simple & intelligente",
    description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel.",
    images: [`${siteUrl}/images/og-image.png`],
    creator: "@facturly",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Facturly",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "description": "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel.",
              "featureList": [
                "Création de factures simplifiée",
                "Envoi par email automatique",
                "Suivi des paiements en temps réel",
                "Gestion de clients et produits",
                "Paiement en ligne sécurisé",
                "Tableau de bord intelligent"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.className}`}
      >
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <>
            <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
            <GoogleTagManagerNoscript gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
          </>
        )}
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}
