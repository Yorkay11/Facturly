import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration standard Next.js (pas de mode standalone)
  
  // Optimisations de performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Headers de sécurité et cache
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // CSP avec unsafe-inline pour script-src et style-src (nécessaire pour Next.js et les templates dynamiques)
          {
            key: 'Content-Security-Policy',
            value: (() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL;
              // Construire connect-src avec l'URL du backend si disponible
              const connectSrc = apiUrl 
                ? `'self' ${apiUrl}` 
                : process.env.NODE_ENV === 'production' 
                  ? "'self'" 
                  : "'self' https: http://localhost:*"; // En dev, permettre localhost et toutes les connexions HTTPS
              
              return [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'", // unsafe-inline nécessaire pour Next.js (hydratation, etc.)
                "style-src 'self' 'unsafe-inline'", // unsafe-inline nécessaire pour les couleurs dynamiques des templates
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                `connect-src ${connectSrc}`, // Autoriser les connexions vers le backend
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : "",
              ].filter(Boolean).join('; ');
            })()
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Bundle analyzer (uniquement si ANALYZE=true)
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config) => config;

export default withBundleAnalyzer(withNextIntl(nextConfig));
