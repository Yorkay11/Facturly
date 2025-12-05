import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://facturly.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/invoices/',
          '/clients/',
          '/items/',
          '/bills/',
          '/settings/',
          '/reminders/',
          '/auth/',
          '/api/',
          '/invoice/',
          '/pay/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

