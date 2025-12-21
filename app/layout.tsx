import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google';

const inter = Nunito({ subsets: ['latin'] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.facturly.online";

// Métadonnées par défaut (français) - Les pages dans [locale] peuvent les surcharger avec generateMetadata
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
        url: `${siteUrl}/icon.png`,
        width: 1200,
        height: 630,
        alt: "Facturly - Facturation simple & intelligente",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Facturly - Facturation simple & intelligente",
    description: "Créez, envoyez et gérez vos factures en toute simplicité. Automatisez votre comptabilité et suivez vos paiements en temps réel.",
    images: [
      {
        url: `${siteUrl}/icon.png`,
        width: 1200,
        height: 630,
        alt: "Facturly - Facturation simple & intelligente",
      },
    ],
    creator: "@facturly",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
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
      <body className={inter.className} suppressHydrationWarning>
        {/* Loader initial qui s'affiche immédiatement avant le chargement du JS */}
        <div id="initial-loader" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          transition: 'opacity 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '2rem',
            borderRadius: '0.75rem'
          }}>
            <div style={{
              position: 'relative',
              width: '8rem',
              height: '8rem'
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '0.75rem',
                border: '4px solid rgba(120, 53, 240, 0.3)',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div id="initial-loader-liquid" style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '0%',
                  backgroundColor: 'rgb(120, 53, 240)',
                  borderRadius: '40% 40% 0 0',
                  transition: 'height 3s linear'
                }}></div>
                <div id="initial-loader-logo" style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  clipPath: 'inset(100% 0 0 0)',
                  transition: 'clip-path 3s linear'
                }}>
                  <img 
                    src="/icon.png" 
                    alt="Facturly" 
                    style={{
                      width: '5rem',
                      height: '5rem',
                      objectFit: 'contain',
                      borderRadius: '0.75rem'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var animationStarted = false;
                var pageLoaded = false;
                
                function startAnimation() {
                  if (animationStarted) return;
                  animationStarted = true;
                  
                  var liquid = document.getElementById('initial-loader-liquid');
                  var logo = document.getElementById('initial-loader-logo');
                  
                  if (liquid) {
                    setTimeout(function() {
                      liquid.style.height = '100%';
                    }, 10);
                  }
                  
                  if (logo) {
                    setTimeout(function() {
                      logo.style.clipPath = 'inset(0% 0 0 0)';
                    }, 10);
                  }
                  
                  // Masquer le loader après que l'animation soit complète (3 secondes)
                  setTimeout(function() {
                    hideLoader();
                  }, 3000);
                }
                
                function hideLoader() {
                  // Attendre que la page soit chargée ET que l'animation soit terminée
                  if (!pageLoaded) return;
                  
                  var loader = document.getElementById('initial-loader');
                  if (loader) {
                    loader.style.opacity = '0';
                    setTimeout(function() {
                      loader.style.display = 'none';
                    }, 300);
                  }
                }
                
                // Démarrer l'animation immédiatement
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', startAnimation);
                } else {
                  startAnimation();
                }
                
                // Marquer que la page est chargée
                window.addEventListener('load', function() {
                  pageLoaded = true;
                  // Si l'animation est déjà terminée, masquer le loader
                  if (animationStarted) {
                    setTimeout(function() {
                      hideLoader();
                    }, Math.max(0, 3000 - (Date.now() - (window.performance.timing.domContentLoadedEventEnd || Date.now()))));
                  }
                });
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
