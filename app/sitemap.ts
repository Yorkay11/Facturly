import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://facturly.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseDate = new Date();
  
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: baseDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: baseDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: baseDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  return routes;
}

