import { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://facturly.online";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseDate = new Date();
  
  // Pages publiques à inclure dans le sitemap
  const publicPages = [
    '', // Page d'accueil
    '/login',
    '/register',
  ];
  
  // Générer les routes pour chaque locale
  const routes: MetadataRoute.Sitemap = [];
  
  routing.locales.forEach((locale) => {
    publicPages.forEach((page) => {
      routes.push({
        url: `${siteUrl}/${locale}${page}`,
        lastModified: baseDate,
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1 : page === '/register' ? 0.9 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((loc) => [loc, `${siteUrl}/${loc}${page}`])
          ),
        },
      });
    });
  });

  return routes;
}

