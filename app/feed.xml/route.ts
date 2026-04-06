import { sanityFetch } from '@/lib/sanity/fetch'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clinicaltocode.com'

interface FeedArticle {
  title: string
  slug: string
  publishedAt: string
  excerpt?: string
  author?: { name: string }
}

export async function GET() {
  const articles = await sanityFetch<FeedArticle[]>({
    query: `*[_type == "article" && !(_id in path("drafts.**")) && defined(publishedAt)]
            | order(publishedAt desc) [0..19] {
              title,
              "slug": slug.current,
              publishedAt,
              excerpt,
              "author": author->{ name }
            }`,
    tags: ['article'],
  })

  const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/articles/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/articles/${a.slug}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      ${a.excerpt ? `<description>${escapeXml(a.excerpt)}</description>` : ''}
      ${a.author?.name ? `<dc:creator>${escapeXml(a.author.name)}</dc:creator>` : ''}
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Clinical to Code</title>
    <link>${SITE_URL}</link>
    <description>Bridging clinical expertise with healthcare IT. Real insights from clinicians for IT leaders.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
