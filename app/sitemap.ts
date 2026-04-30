import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/lib/sanity/fetch'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinicaltocode.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await sanityFetch<{ slug: string; publishedAt: string }[]>({
    query: `*[_type == "article" && !(_id in path("drafts.**")) && defined(publishedAt)]
            | order(publishedAt desc) { "slug": slug.current, publishedAt }`,
    tags: ['article'],
  })

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/articles`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/forum`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/newsletter`, changeFrequency: 'monthly', priority: 0.6 },
    ...articleEntries,
  ]
}
