import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinicaltocode.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/admin/', '/api/', '/auth/', '/settings/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
