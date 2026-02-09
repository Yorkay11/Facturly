import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from 'next/font/google';

const inter = Nunito({ subsets: ['latin'] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string;

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
    <html lang="fr" suppressHydrationWarning>
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
        {/* Script pour mettre à jour dynamiquement l'attribut lang basé sur la locale */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Extraire la locale de l'URL
                const pathname = window.location.pathname;
                const localeMatch = pathname.match(/^\/(fr|en)(\/|$)/);
                const locale = localeMatch ? localeMatch[1] : 'fr';
                
                // Mettre à jour l'attribut lang du document
                if (document.documentElement) {
                  document.documentElement.lang = locale;
                }
              })();
            `,
          }}
        />
        {/* Loader initial professionnel - DÉSACTIVÉ */}
        {/* <div id="initial-loader" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          transition: 'opacity 0.4s ease-out',
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{
              position: 'relative',
              width: '3rem',
              height: '3rem',
              animation: 'loaderLogoPulse 2s ease-in-out infinite'
            }}>
              <img 
                src="/icon.png" 
                alt="Facturly" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '0.75rem',
                  filter: 'drop-shadow(0 4px 12px rgba(120, 53, 240, 0.15))'
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div 
                id="initial-loader-bar-1"
                style={{
                  width: '0.5rem',
                  height: '2.5rem',
                  backgroundColor: 'rgba(120, 53, 240, 0.2)',
                  borderRadius: '0.25rem',
                  transformOrigin: 'bottom',
                  animation: 'loaderBar1 1.2s ease-in-out infinite'
                }}
              ></div>
              <div 
                id="initial-loader-bar-2"
                style={{
                  width: '0.5rem',
                  height: '2.5rem',
                  backgroundColor: 'rgba(120, 53, 240, 0.2)',
                  borderRadius: '0.25rem',
                  transformOrigin: 'bottom',
                  animation: 'loaderBar2 1.2s ease-in-out infinite 0.15s'
                }}
              ></div>
              <div 
                id="initial-loader-bar-3"
                style={{
                  width: '0.5rem',
                  height: '2.5rem',
                  backgroundColor: 'rgba(120, 53, 240, 0.2)',
                  borderRadius: '0.25rem',
                  transformOrigin: 'bottom',
                  animation: 'loaderBar3 1.2s ease-in-out infinite 0.3s'
                }}
              ></div>
              <div 
                id="initial-loader-bar-4"
                style={{
                  width: '0.5rem',
                  height: '2.5rem',
                  backgroundColor: 'rgba(120, 53, 240, 0.2)',
                  borderRadius: '0.25rem',
                  transformOrigin: 'bottom',
                  animation: 'loaderBar4 1.2s ease-in-out infinite 0.45s'
                }}
              ></div>
              <div 
                id="initial-loader-bar-5"
                style={{
                  width: '0.5rem',
                  height: '2.5rem',
                  backgroundColor: 'rgba(120, 53, 240, 0.2)',
                  borderRadius: '0.25rem',
                  transformOrigin: 'bottom',
                  animation: 'loaderBar5 1.2s ease-in-out infinite 0.6s'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes loaderLogoPulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.05);
                opacity: 0.9;
              }
            }
            
            @keyframes loaderBar1 {
              0%, 100% {
                transform: scaleY(0.3);
                background-color: rgba(120, 53, 240, 0.2);
              }
              50% {
                transform: scaleY(1);
                background-color: rgb(120, 53, 240);
              }
            }
            
            @keyframes loaderBar2 {
              0%, 100% {
                transform: scaleY(0.4);
                background-color: rgba(120, 53, 240, 0.2);
              }
              50% {
                transform: scaleY(1);
                background-color: rgb(120, 53, 240);
              }
            }
            
            @keyframes loaderBar3 {
              0%, 100% {
                transform: scaleY(0.5);
                background-color: rgba(120, 53, 240, 0.2);
              }
              50% {
                transform: scaleY(1);
                background-color: rgb(120, 53, 240);
              }
            }
            
            @keyframes loaderBar4 {
              0%, 100% {
                transform: scaleY(0.4);
                background-color: rgba(120, 53, 240, 0.2);
              }
              50% {
                transform: scaleY(1);
                background-color: rgb(120, 53, 240);
              }
            }
            
            @keyframes loaderBar5 {
              0%, 100% {
                transform: scaleY(0.3);
                background-color: rgba(120, 53, 240, 0.2);
              }
              50% {
                transform: scaleY(1);
                background-color: rgb(120, 53, 240);
              }
            }
          `
        }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var pageLoaded = false;
                var minDisplayTime = 800;
                var startTime = Date.now();
                
                function hideLoader() {
                  var loader = document.getElementById('initial-loader');
                  if (!loader) return;
                  
                  var elapsed = Date.now() - startTime;
                  var remainingTime = Math.max(0, minDisplayTime - elapsed);
                  
                  setTimeout(function() {
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                    setTimeout(function() {
                      loader.style.display = 'none';
                      loader.style.visibility = 'hidden';
                    }, 400);
                  }, remainingTime);
                }
                
                function checkAndHide() {
                  if (pageLoaded) {
                    hideLoader();
                  }
                }
                
                if (document.readyState === 'complete') {
                  pageLoaded = true;
                  checkAndHide();
                } else {
                  window.addEventListener('load', function() {
                    pageLoaded = true;
                    checkAndHide();
                  });
                }
                
                setTimeout(function() {
                  if (document.getElementById('initial-loader')) {
                    hideLoader();
                  }
                }, 3000);
              })();
            `,
          }}
        /> */}
        {children}
      </body>
    </html>
  );
}
